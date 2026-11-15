import sqlite3

import pytest

from app.db import connect, init_db


def columns(conn: sqlite3.Connection, table: str) -> set[str]:
    return {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}


def add_user(conn: sqlite3.Connection, email: str = "a@example.com") -> None:
    conn.execute("INSERT INTO users (email, name, password_hash) VALUES (?, 'A', 'x')", (email,))
    conn.commit()


def test_creates_users_table(tmp_path):
    path = tmp_path / "nested" / "dir" / "test.db"
    init_db(path)
    with connect(path) as conn:
        assert columns(conn, "users") == {"id", "email", "name", "password_hash", "created_at"}


def test_email_is_unique(tmp_path):
    path = tmp_path / "test.db"
    init_db(path)
    conn = connect(path)
    add_user(conn)
    with pytest.raises(sqlite3.IntegrityError):
        add_user(conn)
    conn.close()


def test_recreates_database_from_scratch(tmp_path):
    path = tmp_path / "test.db"
    init_db(path)
    conn = connect(path)
    add_user(conn)
    conn.close()

    init_db(path)
    with connect(path) as conn:
        assert conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0


def test_replaces_a_file_that_is_not_a_database(tmp_path):
    path = tmp_path / "test.db"
    path.write_text("stale junk")
    init_db(path)
    with connect(path) as conn:
        assert "users" in {r["name"] for r in conn.execute("SELECT name FROM sqlite_master")}
