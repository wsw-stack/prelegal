from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def static_dir(tmp_path: Path) -> Path:
    """A stand-in for the frontend's static export."""
    out = tmp_path / "out"
    (out / "login").mkdir(parents=True)
    (out / "index.html").write_text("<h1>platform</h1>")
    (out / "login" / "index.html").write_text("<h1>login</h1>")
    (out / "404.html").write_text("<h1>not found</h1>")
    return out


@pytest.fixture
def db_path(tmp_path: Path) -> Path:
    return tmp_path / "data" / "prelegal.db"


@pytest.fixture
def client(db_path: Path, static_dir: Path):
    # Entering the client runs the app's lifespan, which creates the database.
    with TestClient(create_app(db_path=db_path, static_dir=static_dir)) as client:
        yield client


@pytest.fixture(autouse=True)
def no_real_llm(monkeypatch):
    """Tests never reach OpenRouter: no API key, and a LiteLLM that refuses to run."""
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)

    def refuse(**kwargs):
        raise AssertionError("tests must not call the real LLM")

    monkeypatch.setattr("litellm.completion", refuse)
