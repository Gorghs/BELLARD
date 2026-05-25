from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Shadow Music API"
    GOOGLE_DRIVE_FOLDER_ID: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    
    # Algolia
    ALGOLIA_APP_ID: Optional[str] = None
    ALGOLIA_WRITE_KEY: Optional[str] = None
    
    # Firebase
    FIREBASE_CREDENTIALS_PATH: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
