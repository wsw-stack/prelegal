"""FastAPI app: the /api routes plus the statically exported frontend."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app import api, config
from app.db import init_db


def create_app(db_path: Path = config.DB_PATH, static_dir: Path = config.STATIC_DIR) -> FastAPI:
    """Build the app. Tests pass their own paths; otherwise they come from config."""
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        init_db(db_path)
        yield

    app = FastAPI(title="Prelegal", lifespan=lifespan)
    app.include_router(api.router)

    # Mounted last so it never shadows /api. Skipped when the frontend hasn't
    # been built, so the API can run on its own in development and tests.
    if static_dir.is_dir():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="frontend")

    return app


app = create_app()
