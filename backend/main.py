"""Simple entry point to run the FastAPI server"""
from app.config import settings
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True
    )

