# import asyncio
# import os
# import json
# from groq import Groq
# from mcp import ClientSession, StdioServerParameters
# from mcp.client.stdio import stdio_client
# from src.config import settings

# # Path to our Server
# SERVER_SCRIPT = os.path.join(os.getcwd(), "src", "server", "main.py")

# client = Groq(api_key=settings.GROQ_API_KEY)

# async def run_chat_session():
#     print(f"🔌 Connecting to Tutorly Server at: {SERVER_SCRIPT}")
    
#     # --- THE FIX STARTS HERE ---
#     # We copy the current environment variables
#     server_env = dict(os.environ)
#     # We strictly tell the subprocess: "Your root folder is HERE"
#     server_env["PYTHONPATH"] = os.getcwd()
#     # ---------------------------

#     server_params = StdioServerParameters(
#         command="uv",
#         args=["run", SERVER_SCRIPT],
#         env=server_env # Pass the fixed environment
#     )

#     async with stdio_client(server_params) as (read, write):
#         async with ClientSession(read, write) as session:
#             await session.initialize()
            
#             # 1. Discover Tools
#             tools = await session.list_tools()
#             groq_tools = [{
#                 "type": "function",
#                 "function": {
#                     "name": t.name,
#                     "description": t.description,
#                     "parameters": t.inputSchema
#                 }
#             } for t in tools.tools]

#             # 2. System Prompt
#             messages = [{
#                 "role": "system",
#                 "content": """
#                 You are the 'Tutorly Assistant'. Help students find tutors and classes.
                
#                 CRITICAL INSTRUCTION:
#                 You are a "Tool Calling" agent. When you want to use a tool, you must use the native tool calling feature.
#                 - Do NOT write tool calls as text or XML (e.g. <function>). 
#                 - Do NOT output JSON inside the chat message.
#                 - Just output the tool call structure directly.

#                 RULES:
#                 1. If a user asks for a topic (e.g. 'Algebra'), first use 'get_available_subjects' 
#                    or 'get_subject_topics' to confirm the main Subject category.
#                 2. Be concise. Show prices in LKR.
#                 3. If no tutors are found, suggest broadening the search (e.g. removing price limits).
#                 """
#             }]

#             print("\n🤖 Tutorly AI Ready! (Type 'quit' to exit)\n")

#             # 3. Chat Loop
#             while True:
#                 user_input = input("User: ")
#                 if user_input.lower() in ["quit", "exit"]:
#                     break
                
#                 messages.append({"role": "user", "content": user_input})

#                 # Reasoning Loop
#                 while True:
#                     response = client.chat.completions.create(
#                         model=settings.MODEL_NAME,
#                         messages=messages,
#                         tools=groq_tools,
#                         tool_choice="auto"
#                     )
                    
#                     msg = response.choices[0].message
                    
#                     if msg.tool_calls:
#                         print(f"   ⚙️  Thinking... (Calling {len(msg.tool_calls)} tools)")
#                         messages.append(msg)

#                         for tool_call in msg.tool_calls:
#                             args = json.loads(tool_call.function.arguments)
#                             print(f"   🔎  Executing: {tool_call.function.name} with {args}")
                            
#                             result = await session.call_tool(tool_call.function.name, arguments=args)
                            
#                             messages.append({
#                                 "tool_call_id": tool_call.id,
#                                 "role": "tool",
#                                 "name": tool_call.function.name,
#                                 "content": result.content[0].text
#                             })
#                         continue 
#                     else:
#                         print(f"Agent: {msg.content}")
#                         messages.append(msg)
#                         break

# if __name__ == "__main__":
#     asyncio.run(run_chat_session())


import asyncio
import os
import json
from dotenv import load_dotenv

# --- LangChain Imports ---
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate

#------Geminai------
from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI

# --- MCP Imports ---
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# --- Config ---
from src.config import settings

# Load env to ensure keys are ready
load_dotenv()

# Path to our Server (The "Hands")
SERVER_SCRIPT = os.path.join(os.getcwd(), "src", "server", "main.py")

async def run_chat_session():
    print(f"🔌 Connecting to Tutorly Server at: {SERVER_SCRIPT}")
    
    # --- 1. SETUP SERVER ENVIRONMENT ---
    server_env = dict(os.environ)
    server_env["PYTHONPATH"] = os.getcwd() 

    server_params = StdioServerParameters(
        command="uv",
        args=["run", SERVER_SCRIPT],
        env=server_env
    )

    # --- 2. START MCP SESSION ---
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # --- 3. LOAD TOOLS FROM SERVER ---
            # We ask the server: "What can you do?"
            mcp_tools = await session.list_tools()
            
            # Convert MCP tools to OpenAI/LangChain format
            formatted_tools = [{
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.inputSchema
                }
            } for t in mcp_tools.tools]

            print(f"🛠️  Loaded {len(formatted_tools)} tools from server.")

            # --- 4. INITIALIZE LANGCHAIN AGENT ---
            # # This is the "Brain"
            # chat_model = ChatGroq(
            #     model=settings.MODEL_NAME, # e.g., "mixtral-8x7b-32768" or "llama-3.1-70b-versatile"
            #     api_key=settings.GROQ_API_KEY,
            #     temperature=0  # 0 is best for tool usage (more precise)
            # )

            # # We "Bind" the tools to the model. 
            # # This registers them so the LLM knows they exist.
            # llm_with_tools = chat_model.bind(tools=formatted_tools)
            print(f"🧠 Loading Model: {settings.MODEL_NAME}")

            if settings.AI_PROVIDER == "google":
                # Option A: Google Gemini
                chat_model = ChatGoogleGenerativeAI(
                    model=settings.MODEL_NAME,
                    google_api_key=settings.GOOGLE_API_KEY,
                    temperature=0
                )
            else:
                # Option B: Groq (Llama/Mixtral)
                chat_model = ChatGroq(
                    model=settings.MODEL_NAME,
                    api_key=settings.GROQ_API_KEY,
                    temperature=0
                )

            # Bind tools (This works EXACTLY the same for both!)
            llm_with_tools = chat_model.bind_tools(formatted_tools)

            # Define the Personality
            system_message = SystemMessage(content="""
                You are the 'Tutorly Assistant'. 
                Your goal is to help students find tutors and mass classes.

                GUIDELINES:
                1. Always verify the Subject first (e.g. if user says "Math", check if it's "Mathematics").
                2. Use the provided tools to fetch real data.
                3. Be helpful and concise.
                4. Show prices in LKR.
                5. If User don't mention about Tutor type (1-on-1 or Mass Class), ask them to clarify before show results.
                                           
                CRITICAL INSTRUCTION:
                You are a "Tool Calling" agent. When you want to use a tool, you must use the native tool calling feature.
                - Do NOT write tool calls as text or XML (e.g. <function>). 
                - Do NOT output JSON inside the chat message.
                - Just output the tool call structure directly.
                - Don't make guesses, ask clarifying questions if needed.
            """)

            # Chat History (Memory)
            messages = [system_message]

            print("\n🤖 Tutorly AI Ready! (Type 'quit' to exit)\n")

            # --- 5. THE CHAT LOOP ---
            while True:
                user_input = input("User: ")
                if user_input.lower() in ["quit", "exit"]:
                    break
                
                # Add User Message to History
                messages.append(HumanMessage(content=user_input))

                # --- REASONING LOOP (The "Agent" Logic) ---
                while True:
                    # A. Ask the LLM
                    # .ainvoke() is the standard async call in LangChain
                    response = await llm_with_tools.ainvoke(messages)
                    
                    # B. Check if it wants to use a tool
                    # LangChain puts tool calls in a special attribute '.tool_calls'
                    if response.tool_calls:
                        print(f"   ⚙️  Thinking... (Calling {len(response.tool_calls)} tools)")
                        
                        # Add the AI's "thought" (Tool Request) to history
                        messages.append(response)

                        # Execute all requested tools
                        for tool_call in response.tool_calls:
                            tool_name = tool_call["name"]
                            tool_args = tool_call["args"]
                            tool_id = tool_call["id"]

                            print(f"   🔎  Executing: {tool_name} with {tool_args}")

                            # C. Call the MCP Server
                            # We manually execute the tool using our MCP session
                            result = await session.call_tool(tool_name, arguments=tool_args)
                            tool_output = result.content[0].text
                            
                            print(f"   ✅  Result: {tool_output[:100]}...") # Print preview

                            # D. Add Result to History
                            # We use 'ToolMessage' which is the standard way to feed results back
                            messages.append(ToolMessage(
                                tool_call_id=tool_id,
                                content=tool_output,
                                name=tool_name
                            ))
                        
                        # Loop back to let the LLM see the results and decide next step
                        continue
                    
                    else:
                        # E. Final Answer
                        print(f"Agent: {response.content}")
                        messages.append(response)
                        break

if __name__ == "__main__":
    asyncio.run(run_chat_session())