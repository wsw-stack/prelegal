# prelegal
A platform for drafting common legal agreements.

> **🚧 Status: In progress**
>
> This project is under active development and is expected to be completed within 1 week (target: October 14, 2026). Features and documentation may change in the meantime.

## Running

Prelegal runs as a single Docker container: a FastAPI backend that also serves the statically built Next.js frontend. Docker must be installed and running.

```bash
# Mac
scripts/start-mac.sh
scripts/stop-mac.sh

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows (PowerShell)
scripts/start-windows.ps1
scripts/stop-windows.ps1
```

The app is then at http://localhost:8000. Sign in is a placeholder for now: any name and email gets you into the platform.

Environment variables in a `.env` file at the repo root are passed to the container. The SQLite database is temporary and is recreated from scratch each time the container starts.

## Development

```bash
# Frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
npm test

# Backend (http://localhost:8000; serves frontend/out if it has been built with `npm run build`)
cd backend
uv run uvicorn app.main:app --reload
uv run pytest
```
