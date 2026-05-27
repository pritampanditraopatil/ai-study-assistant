"""AI Study Assistant – FastAPI application entry point.

Run with::

    uvicorn main:app --reload
"""

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db import close_db, connect_db

# ── Import routers ───────────────────────────────────────────────────────
from routes.subjects_routes import router as subjects_router
from routes.topics_routes import router as topics_router
from routes.notes_routes import router as notes_router
from routes.maps_routes import router as maps_router


# ── Lifespan ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Manage application startup and shutdown.

    * **Startup**: establish the MongoDB connection.
    * **Shutdown**: close the MongoDB connection gracefully.
    """
    await connect_db()
    yield
    await close_db()


# ── Application ──────────────────────────────────────────────────────────

app = FastAPI(
    title="AI Study Assistant API",
    description=(
        "Backend API for the AI Study Assistant – manage subjects, topics, "
        "notes, and AI-generated concept mindmaps."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ────────────────────────────────────────────────────

app.include_router(subjects_router)
app.include_router(topics_router)
app.include_router(notes_router)
app.include_router(maps_router)


# ── Health check ─────────────────────────────────────────────────────────

@app.get(
    "/api/health",
    tags=["Health"],
    summary="Health check",
)
async def health_check() -> dict[str, str]:
    """Return a simple health-check response to verify the API is running."""
    return {"status": "ok"}
