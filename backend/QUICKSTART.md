# Quick Start Guide

## Prerequisites

1. **Install Ollama** and ensure it's running:
   ```bash
   # Download from https://ollama.ai
   # Then pull the model:
   ollama pull qwen3:8b
   ```

2. **Python 3.9+** installed

## Setup & Run

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # Windows:
   venv\Scripts\activate
   
   # Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the server:**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:3000`

## Testing the API

Once the server is running, you can test it:

```bash
# Health check
curl http://localhost:3000/

# Chat endpoint
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how do you say good morning in German?",
    "language": "en-de",
    "formality": "du"
  }'
```

## Frontend Integration

The frontend is already configured to connect to `http://localhost:3000` by default.

To change the API URL, set the `VITE_API_BASE_URL` environment variable in your frontend `.env` file.

