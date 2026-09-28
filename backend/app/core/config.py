"""
Configuration and settings for Multi-Agent AI Travel Planner backend.
"""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Multi-Agent AI Travel Planner"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: str = ""
    DATABASE_URL: str = "sqlite:///./travel_planner.db"  # Defaults to SQLite locally or PostgreSQL
    USE_DEMO_DATA: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
