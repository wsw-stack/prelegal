# Prelegal Project

## Overview

This is a SaaS product to allow users to draft legal agreements based on templates in the templates directory.
The user can carry out AI chat in order to establish what document they want and how to fill in the fields.
The available documents are covered in the catalog.json file in the project root, included here:

@catalog.json

The target is all document types via AI chat, with full user authentication and document persistence. See "Current status" below for what is built so far.

Note: the `filename` values in the root catalog.json (e.g. `Mutual-NDA.md`) don't match the actual files in templates/, which are lowercase (e.g. `mutual-nda.md`). templates/catalog.json has the real ids and file names.

## Development process

When instructed to build a feature:
1. Use your Atlassian tools to read the feature instructions from Jira
2. Develop the feature - do not skip any step from the feature-dev 7 step process
3. Thoroughly test the feature with unit tests and integration tests and fix any issues
4. Submit a PR using your github tools

## AI design

When writing code to make calls to LLMs, use your Cerebras skill to use LiteLLM via OpenRouter to the `openrouter/openai/gpt-oss-120b` model with Cerebras as the inference provider. You should use Structured Outputs so that you can interpret the results and populate fields in the legal document.

The OPENROUTER_API_KEY goes in the .env file in the project root. The start scripts pass .env to the container at run time; it is never copied into the image.

## Technical design

The entire project should be packaged into a Docker container.  
The backend should be in backend/ and be a uv project, using FastAPI.  
The frontend should be in frontend/  
The database should use SQLLite and be created from scratch each time the Docker container is brought up, allowing for a users table with sign up and sign in.  
The frontend is statically exported (`output: "export"`, `trailingSlash: true`) and served by FastAPI. Static export rules out server-only Next.js features: no API routes, server actions, middleware, rewrites, `cacheComponents`/partial prerendering, or dynamic routes without `generateStaticParams`. All server logic goes in the FastAPI backend under `/api`.  
There should be scripts in scripts/ for:  
```bash
# Mac
scripts/start-mac.sh    # Start
scripts/stop-mac.sh     # Stop

# Linux
scripts/start-linux.sh
scripts/stop-linux.sh

# Windows
scripts/start-windows.ps1
scripts/stop-windows.ps1
```
Backend available at http://localhost:8000

## Current status

Implemented so far (PL-2 to PL-5):
- **Frontend** (Next.js 16.4 + Tailwind 4 + vitest): a Mutual NDA builder at `/`: an AI chat (`components/ChatPanel.tsx`, `lib/chat/api.ts`) that fills in the fields, a live preview, and PDF download via `@react-pdf/renderer`. Agreement text is bundled at build time from `templates/mutual-nda.md` (`?raw` import). Read frontend/AGENTS.md before writing Next.js code.
- **Fake login**: `/login` accepts any name and email and stores them in localStorage (`frontend/lib/auth/session.ts`). `AuthGate` redirects signed-out users and `UserBar` signs out. There is no real authentication yet.
- **Backend** (`backend/`): `app/main.py` has a `create_app()` factory that includes the `/api` router (`app/api/`: `/api/health`, `/api/chat`, plus a JSON 404 catch-all) and then mounts the static frontend at `/`. Add feature routers in `app/api/__init__.py`.
- **AI chat**: `POST /api/chat` is stateless. The browser sends the conversation and the current NDA fields, and gets back `{reply, fields}` with the full updated fields. `app/llm.py` is the only module that imports LiteLLM (`complete_structured`), and `app/nda.py` holds the Pydantic field models, which mirror `frontend/lib/nda/types.ts`, plus the system prompt. A missing `OPENROUTER_API_KEY` gives a 503, and an LLM failure gives a 502. Tests never call the real LLM.
- **Database**: `app/db.py` deletes and recreates SQLite with a `users` table on every startup. The table is not used yet. The path comes from `PRELEGAL_DB_PATH`, and the static dir from `PRELEGAL_STATIC_DIR`.
- **Docker**: a multi-stage `Dockerfile` (Node build, then Python + uv runtime), plus the start/stop scripts above.
- **Tests**: `cd frontend && npm test`, `cd backend && uv run pytest`.

Not built yet: real sign up and sign in, document types other than the Mutual NDA, and document persistence.
