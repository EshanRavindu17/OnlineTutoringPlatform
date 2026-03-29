# 🤖 Tutorly AI Agent Service

The Tutorly AI Agent is an intelligent backend service designed to help students find 1-on-1 tutors and mass classes.

It uses **LangChain** for orchestration, **FastAPI** for serving HTTP requests, and the **Model Context Protocol (MCP)** via `FastMCP` to securely connect the Large Language Model (LLM) to our backend database tools.

---

## 🏗️ Architecture

- **The Brain (`src/client/api.py`):** A FastAPI application that manages chat memory, enforces JSON output schemas, and talks to the AI provider (OpenRouter, Google, or Groq).
- **The Hands (`src/server/main.py` & `tools.py`):** An MCP Server that exposes our internal database queries (`get_available_subjects`, `find_individual_tutors`, etc.) as standard tools the AI can use.

---

## ⚙️ Prerequisites

1. **Python 3.12+** must be installed on your system.
2. **`uv` Package Manager**: We use `uv` for fast dependency management and isolated execution.

   **Windows Installation (PowerShell)**
   ```powershell
   powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

   **Linux/macOS/WSL Installation**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

   Note: Restart your terminal after installing `uv` for the first time.

---

## 🚀 Setup & Installation

1. Navigate to the project directory:
   ```bash
   cd path/to/OnlineTutoringPlatform/Agent
   ```

2. Sync dependencies:
   ```bash
   uv sync
   ```

This installs FastAPI, LangChain, MCP, Uvicorn, and all necessary API wrappers.

---

## 🔑 Environment Variables

Create a file named `.env` in the root of your `Agent` directory:

```ini
# .env

# Recommended: OpenRouter
OPENROUTER_API_KEY=your_openrouter_key_here

# Alternative: Google Gemini
GOOGLE_API_KEY=your_google_key_here

# Alternative: Groq
GROQ_API_KEY=your_groq_key_here
```

---

## 🧠 Model Configuration

You can switch which AI model powers Tutorly without changing any core logic.
Open `src/config.py` and adjust the settings:

```python
class Settings:
    # Set this to "openrouter", "google", or "groq"
    AI_PROVIDER = "openrouter"

    # Recommended free model for development
    MODEL_NAME = "meta-llama/llama-3.1-8b-instruct:free"

    # ... env loading ...
```

Note: If using OpenRouter, append `:free` to the model name if you want the free tier (to avoid 402 Payment Required).

---

## 🏃‍♂️ Running the API

Start the FastAPI server using `uv` + `uvicorn`:

```bash
uv run uvicorn src.client.api:app --reload
```

The server should run at `http://127.0.0.1:8000`.

---

## 🧪 Testing the API

Open the interactive Swagger UI:

- `http://127.0.0.1:8000/docs`

Test `POST /api/chat` with:

```json
{
  "user_id": "user_123",
  "message": "Find me a mathematics tutor"
}
```

Expected response shape:

```json
{
  "reply": "Here are some tutors I found for Calculus.",
  "tutors": [
    {
      "name": "Eshan Ravindu",
      "image": "https://res.cloudinary.com/...jpg",
      "subject": "Mathematics",
      "topic": "Calculus",
      "tutorid": "6c2a8b59-6d5e-4f88-9640-7d10f5c683b4"
    }
  ],
  "classes": []
}
```

---

## 🐛 Common Troubleshooting

- **`ModuleNotFoundError: No module named X`**: You ran `python file.py` instead of `uv run ...`. Always execute through `uv run` so Python uses the correct environment.
- **`429 Rate Limit Error` (OpenRouter)**: The free model is busy. Switch `MODEL_NAME` to another free option (e.g. `mistralai/mistral-7b-instruct:free`).
- **`402 Payment Required` (OpenRouter)**: You selected a paid model without credits. Use a model with the `:free` suffix.
- **JSON parse errors / list output blocks**: Some models return arrays of content blocks; ensure `src/client/api.py` extracts text blocks before calling `json.loads()`.

