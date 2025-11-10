# German Tutor Backend API

FastAPI backend for the German Tutor application using Ollama with Qwen3:8b model.

## Prerequisites

1. **Ollama** must be installed and running
   - Download from: https://ollama.ai
   - Install the `qwen3:8b` model:
     ```bash
     ollama pull qwen3:8b
     ```

2. **Python 3.9+** installed

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On Linux/Mac:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. (Optional) Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

## Running the Server

Simply run:
```bash
python main.py
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

The API will be available at `http://localhost:3000`

## API Endpoints

### Health Check
- **GET** `/`
- Returns API status and model information

### Chat
- **POST** `/chat`
- Request body:
  ```json
  {
    "message": "Hello, how do you say 'good morning' in German?",
    "language": "en-de",
    "formality": "du",
    "conversationHistory": [
      {
        "role": "user",
        "content": "Hello"
      },
      {
        "role": "assistant",
        "content": "Hallo!"
      }
    ]
  }
  ```
- Response:
  ```json
  {
    "response": "Guten Morgen! That's how you say 'good morning' in German.",
    "translatedText": null
  }
  ```

### Create Course
- **POST** `/create-course`
- Request body:
  ```json
  {
    "level": "A1",
    "dailyStudyHours": 1.5,
    "goals": "I want to pass the B2 exam"
  }
  ```
- Response:
  ```json
  {
    "courseName": "German A1 Course",
    "level": "A1",
    "lessons": [
      {
        "title": "Introduction to German",
        "content": "...",
        "vocabulary": ["Hallo", "Guten Tag"],
        "grammar": ["Basic greetings"],
        "exercises": ["Practice greeting 5 people"]
      }
    ],
    "estimatedDuration": "8 weeks"
  }
  ```

## Configuration

Configuration can be set via environment variables or `.env` file:

- `OLLAMA_BASE_URL`: Ollama API base URL (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model name to use (default: `qwen3:8b`)
- `API_HOST`: API host (default: `0.0.0.0`)
- `API_PORT`: API port (default: `3000`)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

## Troubleshooting

### Ollama Connection Error
- Ensure Ollama is running: `ollama serve`
- Verify the model is installed: `ollama list`
- Check the `OLLAMA_BASE_URL` in your `.env` file

### Port Already in Use
- Change the `API_PORT` in `.env` or use a different port
- Kill the process using the port if needed

## Development

The backend uses:
- **FastAPI** for the web framework
- **Pydantic** for data validation
- **Requests** for Ollama API calls
- **Uvicorn** as the ASGI server

