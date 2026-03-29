import asyncio
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# --- LangChain Imports ---
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

# --- MCP Imports ---
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# --- Config ---
from src.config import settings

load_dotenv()

# Path to our Server
SERVER_SCRIPT = os.path.join(os.getcwd(), "src", "server", "main.py")

# --- 1. Define API Request & Response Models ---
class ChatRequest(BaseModel):
    user_id: str     # <-- NEW: Required to track who is talking
    message: str

class IndividualTutorDetails(BaseModel):
    name: str
    image: str
    subject: str
    topic: str
    tutorid: str
    rate: str
    rating: str

class MassClassDetails(BaseModel):
    title: str
    name: str
    image: str
    classid: str
    rating: str
    price: str

class ChatResponse(BaseModel):
    reply: str
    tutors: List[IndividualTutorDetails]
    classes: List[MassClassDetails]

# --- 2. Initialize FastAPI & In-Memory Storage ---
app = FastAPI(title="Tutorly Agent API")

# Allow the Vite dev server (and localhost variants) to call this API from the browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dictionary to hold chat history: { "user123": [SystemMessage, HumanMessage, AIMessage, ...] }
user_sessions: Dict[str, list] = {}

# The strict JSON System Prompt
SYSTEM_PROMPT = """
You are the 'Tutorly Assistant'. Help students find tutors.

CRITICAL RULES:
GUIDELINES:
1. Always verify the Subject first (e.g. if user says "Math", check if it's "Mathematics").
2. Use the provided tools to fetch real data.
3. Be helpful and concise.
4. Show prices in LKR.
5. When you show subjects or topics, list them clearly for the user to choose from with comma separated values.
5. If User don't mention about Tutor type (1-on-1 or Mass Class), ask them to clarify before show results.
6. If you give any tutor recommendations, you must follow following JSON format strictly. Do not add any extra text outside the JSON.
Your response must strictly match this JSON schemas.:

*******For 1-on-1 Tutors:*******
    "tutors": [
        {
            "name": "Tutor Name",
            "image": "image url or empty string",
            "subject": "Maths",
            "topic": "Algebra",
            "tutorid": "their-uuid"
        }
    ]
*******For Mass Classes:*******
    "classes": [
        {
            "Title": "Class Name",
            "name": "Tutor Name",
            "image": "image url or empty string",
            "classid": "their-uuid",
            "rating": "4.5 Stars",
            "price": "5000 LKR/month"
        }
    ]
*******For Final Reply *******
Json Object should be sent with two main keys: "tutors" and "classes". Each is an array of objects. If no tutors or classes are found, return an empty array for that key. Do not include any text outside the JSON object. The "reply" key can be used for any final messages to the user, but keep it concise.
(Example Final Output: {"reply": "Here are some tutors I found for Algebra.", "tutors": [...], "classes": [...]})    

7.Talk in humen language for other conversational messages, but strictly follow the JSON format for tutor recommendations.

If no tutors are discussed or found, return an empty array for "tutors": [].
"""

# --- 3. The API Endpoint ---
@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    print(f"🔌 Starting API Request for User: {request.user_id}")
    
    # Initialize chat history for a new user
    if request.user_id not in user_sessions:
        user_sessions[request.user_id] = [SystemMessage(content=SYSTEM_PROMPT)]
    
    # Add the new user message to their specific history
    user_sessions[request.user_id].append(HumanMessage(content=request.message))

    # SAFETY VALVE: Sliding Window Memory (Keep System Prompt + Last 10 interactions)
    if len(user_sessions[request.user_id]) > 21:
        user_sessions[request.user_id] = [user_sessions[request.user_id][0]] + user_sessions[request.user_id][-20:]

    # Grab the history we will send to the LLM
    current_messages = user_sessions[request.user_id]

    server_env = dict(os.environ)
    server_env["PYTHONPATH"] = os.getcwd() 

    server_params = StdioServerParameters(
        command="uv",
        args=["run", SERVER_SCRIPT],
        env=server_env
    )

    # Open connection to the tools server
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Load Tools
            mcp_tools = await session.list_tools()
            formatted_tools = [{
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.inputSchema
                }
            } for t in mcp_tools.tools]

            # Initialize Model
            if settings.AI_PROVIDER == "google":
                chat_model = ChatGoogleGenerativeAI(
                    model=settings.MODEL_NAME,
                    google_api_key=settings.GOOGLE_API_KEY,
                    temperature=0
                )
            else:
                chat_model = ChatGroq(
                    model=settings.MODEL_NAME,
                    api_key=settings.GROQ_API_KEY,
                    temperature=0
                )

            llm_with_tools = chat_model.bind_tools(formatted_tools)

            # --- Reasoning Loop ---
            while True:
                response = await llm_with_tools.ainvoke(current_messages)
                
                if response.tool_calls:
                    print(f"   ⚙️  Calling {len(response.tool_calls)} tools...")
                    # Save the AI's tool request to history
                    current_messages.append(response)

                    for tool_call in response.tool_calls:
                        tool_name = tool_call["name"]
                        tool_args = tool_call["args"]
                        tool_id = tool_call["id"]

                        print(f"   🔎  Executing: {tool_name}")
                        result = await session.call_tool(tool_name, arguments=tool_args)
                        
                        # Save the tool's result to history
                        current_messages.append(ToolMessage(
                            tool_call_id=tool_id,
                            content=result.content[0].text,
                            name=tool_name
                        ))
                    continue # Loop back so LLM can read the tool results
                
                else:
                    current_messages.append(response)
                    
                    # Process the final JSON output
                    final_content = response.content
                    print(f"✅ Raw LLM Output: {final_content}")
                    
                    # --- THE FIX: HANDLE LIST FORMAT ---
                    if isinstance(final_content, list):
                        # Extract the actual text from the blocks
                        extracted_text = ""
                        for block in final_content:
                            if isinstance(block, dict) and 'text' in block:
                                extracted_text += block['text']
                            elif isinstance(block, str):
                                extracted_text += block
                        final_content = extracted_text
                    # -----------------------------------
                    
                    try:
                        # Clean markdown formatting if the LLM adds it
                        clean_json = final_content.replace("```json", "").replace("```", "").strip()
                        parsed_data = json.loads(clean_json)
                        return parsed_data 
                        
                    except json.JSONDecodeError:
                        print("❌ LLM failed to output valid JSON.")
                        return {
                            "reply": final_content,
                            "tutors": [],
                            "classes": []

                        }