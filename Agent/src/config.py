import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    API_BASE_URL = os.getenv("TUTORLY_API_BASE_URL", "http://localhost:5000")
    MODEL_NAME = "gemini-2.5-flash" 
    AI_PROVIDER = "google"
    # Timeout for your backend API calls (in seconds)
    API_TIMEOUT = 10.0

settings = Settings()