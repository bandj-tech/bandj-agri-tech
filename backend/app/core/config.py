import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

class Settings:
    def __init__(self):
        # Database - SQLite
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./smart_soil.db")

        # Telerivet
        self.telerivet_api_key: str = os.getenv("TELERIVET_API_KEY")
        self.telerivet_project_id: str = os.getenv("TELERIVET_PROJECT_ID")

        # Weather
        self.openweather_api_key: str = os.getenv("OPENWEATHER_API_KEY")

        # AI (at least one required)
        self.google_gemini_api_key: Optional[str] = os.getenv("GOOGLE_GEMINI_API_KEY")
        self.openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")

        # App
        self.api_secret_key: str = os.getenv("API_SECRET_KEY")
        self.backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

settings = Settings()
