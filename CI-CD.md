# CI/CD Pipeline Documentation

This project includes a CI/CD pipeline configuration using GitHub Actions.

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) automatically runs on:
- Pushes to `main` and `develop` branches
- Pull requests to `main` and `develop` branches
- Manual triggers via workflow_dispatch

### Pipeline Stages

1. **Backend Testing** (`backend-test`)
   - Lints Python code with flake8
   - Checks code formatting with black
   - Type checks with mypy
   - Runs tests (if available)

2. **Frontend Testing** (`frontend-test`)
   - Lints TypeScript/React code
   - Type checks with TypeScript
   - Builds the application

3. **Build Backend Docker Image** (`build-backend`)
   - Builds Docker image for backend
   - Pushes to GitHub Container Registry (ghcr.io)
   - Only pushes on non-PR events

4. **Build Frontend Docker Image** (`build-frontend`)
   - Builds Docker image for frontend
   - Pushes to GitHub Container Registry (ghcr.io)
   - Only pushes on non-PR events

5. **Test Docker Compose** (`test-docker-compose`)
   - Tests docker-compose setup
   - Verifies services start correctly
   - Only runs on pull requests

6. **Deploy** (`deploy`)
   - Deployment stage (customize based on your infrastructure)
   - Only runs on pushes to `main` branch

### Setup for GitHub Actions

1. **Enable GitHub Actions**: Already configured, just push to the repository

2. **Container Registry**: Images are automatically pushed to GitHub Container Registry
   - View images at: `https://github.com/USERNAME/REPO/pkgs/container/REPO-backend`
   - View images at: `https://github.com/USERNAME/REPO/pkgs/container/REPO-frontend`

3. **Secrets** (if needed for deployment):
   - Go to Repository Settings → Secrets and variables → Actions
   - Add any required secrets (e.g., SSH keys, API tokens)

### Customizing Deployment

Edit the `deploy` job in `.github/workflows/ci-cd.yml` to add your deployment steps:

```yaml
- name: Deploy to server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.HOST }}
    username: ${{ secrets.USERNAME }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /path/to/app
      docker-compose pull
      docker-compose up -d
```

## Using the Built Images

### Pull and Run Locally

**Backend:**
```bash
docker pull ghcr.io/USERNAME/REPO-backend:latest
docker run -p 3000:3000 \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  ghcr.io/USERNAME/REPO-backend:latest
```

**Frontend:**
```bash
docker pull ghcr.io/USERNAME/REPO-frontend:latest
docker run -p 8080:80 ghcr.io/USERNAME/REPO-frontend:latest
```

### Using with Docker Compose

Update `docker-compose.yml` to use the registry images:

```yaml
services:
  backend:
    image: ghcr.io/USERNAME/REPO-backend:latest
    # ... rest of config
  
  frontend:
    image: ghcr.io/USERNAME/REPO-frontend:latest
    # ... rest of config
```

## Environment Variables

The workflow uses these environment variables:
- `REGISTRY`: Container registry URL (default: `ghcr.io`)
- `IMAGE_NAME`: Repository name (automatically set)

## Troubleshooting

### Build Failures

1. **Backend tests failing**: Check Python version compatibility
2. **Frontend build failing**: Verify Node.js version and dependencies
3. **Docker build failing**: Check Dockerfile syntax and context paths

### Registry Push Failures

1. Ensure repository has Actions enabled and proper permissions
2. Check that `GITHUB_TOKEN` has write permissions for packages
3. Verify repository settings allow package publishing

### Deployment Issues

1. Verify deployment credentials are set correctly
2. Check network connectivity to deployment target
3. Ensure deployment scripts have proper permissions

## Best Practices

1. **Branch Protection**: Protect `main` branch and require PR reviews
2. **Secrets Management**: Never commit secrets; use CI/CD secrets/variables
3. **Image Tagging**: Use semantic versioning for production images
4. **Testing**: Add comprehensive tests before enabling strict CI checks
5. **Monitoring**: Set up notifications for pipeline failures

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

