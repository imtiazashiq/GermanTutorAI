# Docker Setup Guide

This project includes Dockerfiles for both the frontend and backend, as well as a docker-compose.yml file to run them together.

## Prerequisites

- Docker installed on your system
- Docker Compose installed (usually comes with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000

## Individual Docker Builds

### Backend Only

```bash
cd backend
docker build -t german-tutor-backend .
docker run -p 3000:3000 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -e OLLAMA_MODEL=qwen3:8b \
  german-tutor-backend
```

### Frontend Only

```bash
docker build -t german-tutor-frontend --build-arg VITE_API_BASE_URL=/api .
docker run -p 8080:80 german-tutor-frontend
```

Note: When running frontend separately, you'll need to configure the API URL appropriately.

## Environment Variables

### Backend

- `OLLAMA_BASE_URL`: URL of the Ollama service (default: `http://host.docker.internal:11434`)
- `OLLAMA_MODEL`: Model name to use (default: `qwen3:8b`)
- `API_HOST`: Host to bind to (default: `0.0.0.0`)
- `API_PORT`: Port to listen on (default: `3000`)
- `CORS_ORIGINS`: Comma-separated list of allowed CORS origins

### Frontend

- `VITE_API_BASE_URL`: Base URL for API calls (default: `/api` when using docker-compose)

## Important Notes

1. **Ollama Service**: The backend requires an Ollama service running. If Ollama is running on your host machine, the docker-compose setup uses `host.docker.internal` to access it. For Linux, you may need to add `extra_hosts` to docker-compose.yml.

2. **API Routing**: When using docker-compose, the frontend is configured to use `/api` as the API base URL, which nginx proxies to the backend. This allows both services to be accessed through the frontend's domain.

3. **Development Mode**: For development, you can uncomment the volume mount in docker-compose.yml to enable hot-reload:
   ```yaml
   volumes:
     - ./backend:/app
   ```

## Troubleshooting

### Backend can't connect to Ollama

If you're on Linux, update docker-compose.yml to add:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Or use your machine's IP address instead of `host.docker.internal`.

### Frontend can't reach backend

Ensure both services are on the same Docker network (they should be when using docker-compose). Check that the `VITE_API_BASE_URL` is set correctly.

### Port conflicts

If ports 3000 or 8080 are already in use, modify the port mappings in docker-compose.yml:
```yaml
ports:
  - "3001:3000"  # Change host port
```

