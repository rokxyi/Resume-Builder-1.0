import os
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

class AIModelConfig(BaseModel):
    provider: str
    model_id: str
    display_name: str
    description: str
    api_model_name: str  # The actual model name sent to the API

class Settings:
    # Database
    DB_NAME = "resume_builder.db"
    DB_PATH = ROOT_DIR / DB_NAME
    
    # API Keys
    LLM_API_KEY = os.getenv("LLM_API_KEY", "")
    
    # Directories
    UPLOAD_DIR = ROOT_DIR / "uploads"
    GENERATED_DIR = ROOT_DIR / "generated"
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

    # AI Models
    AVAILABLE_MODELS: List[AIModelConfig] = [
        AIModelConfig(
            provider="perplexity",
            model_id="sonar-pro",
            display_name="Perplexity Sonar Pro",
            description="Advanced online reasoning model by Perplexity",
            api_model_name="sonar-pro"
        ),

    ]
    
    @classmethod
    def get_model_config(cls, model_id: str) -> AIModelConfig:
        for model in cls.AVAILABLE_MODELS:
            if model.model_id == model_id:
                return model
        # Default fallback or raise
        raise ValueError(f"Unknown model ID: {model_id}")

    @classmethod
    def ensure_directories(cls):
        cls.UPLOAD_DIR.mkdir(exist_ok=True)
        cls.GENERATED_DIR.mkdir(exist_ok=True)

settings = Settings()
