"""Configuration settings for the backend"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Ollama configuration
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:8b"
    
    # API configuration
    api_host: str = "0.0.0.0"
    api_port: int = 3000
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://192.168.0.101:8080",
        "http://192.168.0.101:5173",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

