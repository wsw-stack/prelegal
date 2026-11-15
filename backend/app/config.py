"""Runtime settings, overridable with environment variables."""

import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# The SQLite database is temporary: it is deleted and recreated on every start.
DB_PATH = Path(os.getenv("PRELEGAL_DB_PATH", REPO_ROOT / "backend" / "data" / "prelegal.db"))

# The statically exported frontend (`npm run build` in frontend/).
STATIC_DIR = Path(os.getenv("PRELEGAL_STATIC_DIR", REPO_ROOT / "frontend" / "out"))
