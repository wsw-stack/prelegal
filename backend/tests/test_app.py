from fastapi.testclient import TestClient

from app.db import connect
from app.main import create_app


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_startup_creates_empty_database(client, db_path):
    assert db_path.exists()
    with connect(db_path) as conn:
        assert conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0


def test_serves_frontend_index(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "platform" in response.text


def test_serves_login_page_with_or_without_trailing_slash(client):
    assert "login" in client.get("/login/").text
    response = client.get("/login", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"].endswith("/login/")


def test_unknown_page_uses_frontend_404(client):
    response = client.get("/nope/")
    assert response.status_code == 404
    assert "not found" in response.text


def test_unknown_api_route_is_json_404(client):
    response = client.get("/api/nope")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")


def test_api_runs_without_built_frontend(tmp_path):
    app = create_app(db_path=tmp_path / "t.db", static_dir=tmp_path / "missing")
    with TestClient(app) as client:
        assert client.get("/api/health").status_code == 200
        assert client.get("/").status_code == 404
