"""HTTP API, mounted under /api. Feature routers are included in `router`."""

from fastapi import APIRouter, HTTPException

from app.api import chat, health

router = APIRouter(prefix="/api")
router.include_router(health.router)
router.include_router(chat.router)


# Registered last: without it, unknown /api paths would fall through to the
# frontend and get an HTML page instead of a JSON 404.
@router.api_route("/{path:path}", methods=["GET", "POST", "PUT", "PATCH", "DELETE"], include_in_schema=False)
def not_found(path: str) -> None:
    raise HTTPException(status_code=404, detail="Not Found")
