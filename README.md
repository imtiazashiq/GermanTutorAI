# German Learning Assistant

An AI-powered German learning application that helps you master German through interactive conversations, personalized courses, and structured lessons.

## Features

- **Interactive Chat**: Practice German conversations with an AI tutor
- **Personalized Courses**: Create custom courses based on proficiency level (A1-C1)
- **Structured Lessons**: Access lessons with vocabulary, grammar, and exercises
- **Progress Tracking**: Monitor learning progress and track completed lessons
- **Flexible Learning**: Choose between formal (Sie) and informal (Du) language forms

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Backend:** FastAPI, Ollama (Qwen3:8b), Python 3.9+

## Prerequisites

⚠️ **Before running this project, you must install Ollama:**

1. Download and install [Ollama](https://ollama.ai)
2. Pull the required model:
   ```bash
   ollama pull qwen3:8b
   ```
3. Verify installation:
   ```bash
   ollama list
   ```

**Other Requirements:**
- Python 3.9+
- Node.js 18+ and npm
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/imtiazashiq/GermanTutorAI
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# From project root
npm install
```

## Configuration (Optional)

Create a `.env` file in the `backend` directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
API_HOST=0.0.0.0
API_PORT=3000
CORS_ORIGINS=http://localhost:8080
```

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running the Application

1. **Start Ollama** (required):
   ```bash
   ollama serve
   ```

2. **Start the Backend** (in one terminal):
   ```bash
   cd backend
   python main.py
   ```
   Backend will be available at `http://localhost:3000`

3. **Start the Frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   Frontend will be available at `http://localhost:8080`

## Project Structure

```
chat-en-de/
├── backend/          # FastAPI backend
│   ├── app/         # Application code
│   └── requirements.txt
├── src/             # React frontend
│   ├── components/  # React components
│   ├── lib/         # API client
│   └── pages/       # Page components
└── public/          # Static assets
```

## API Endpoints

- **GET** `/` - Health check
- **POST** `/chat` - Send chat message
- **POST** `/create-course` - Create personalized course
- **POST** `/generate-exercises` - Generate exercises for a lesson
- **POST** `/update-progress` - Update user progress
- **GET** `/get-progress` - Get user progress

For detailed API documentation, visit `http://localhost:3000/docs` when the backend is running, or see [backend/README.md](backend/README.md)

## Development

**Frontend:**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Lint code
```

**Backend:**
- API Documentation: `http://localhost:3000/docs` (Swagger UI)
- Alternative Docs: `http://localhost:3000/redoc` (ReDoc)

## Troubleshooting

**Ollama Issues:**
- Ensure Ollama is installed and running: `ollama serve`
- Verify model is installed: `ollama list`
- Pull model if missing: `ollama pull qwen3:8b`

**Port Already in Use:**
- Backend: Change `API_PORT` in backend `.env` file
- Frontend: Change port in `vite.config.ts` or use `npm run dev -- --port 8081`

**CORS Errors:**
- Ensure `CORS_ORIGINS` in backend `.env` includes `http://localhost:8080`

**Dependencies:**
- Backend: `pip install -r requirements.txt --upgrade`
- Frontend: Delete `node_modules` and `package-lock.json`, then run `npm install`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [Ollama](https://ollama.ai) for local LLM inference
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [Tailwind CSS](https://tailwindcss.com) for styling
