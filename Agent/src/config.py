import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    OPEN_ROUTER_API_KEY = os.getenv("OPEN_ROUTER_API_KEY")
    API_BASE_URL = os.getenv("TUTORLY_API_BASE_URL", "http://localhost:5000")
    MODEL_NAME = "llama-3.1-8b-instant" 
    AI_PROVIDER = "groq"  # or "google"
    # Timeout for your backend API calls (in seconds)
    API_TIMEOUT = 10.0

settings = Settings()