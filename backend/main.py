"""
main.py
-------
Application entry point for the AI Study Assistant backend.

Creates the FastAPI application, registers middleware, mounts all routers,
and manages the database connection lifecycle via an async lifespan context
manager.

Running locally
---------------
.. code-block:: bash

    uvicorn main:app --reload --port 8000

The interactive API docs will be available at:
  - Swagger UI : http://localhost:8000/docs
  - ReDoc      : http://localhost:8000/redoc
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from db import close_db, connect_db
from routes.maps_routes import router as maps_router
from routes.notes_routes import router as notes_router
from routes.subjects_routes import router as subjects_router
from routes.topics_routes import router as topics_router

# --------------------------------------------------------------------------- #
# Logging configuration
# --------------------------------------------------------------------------- #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# Lifespan (startup / shutdown)
# --------------------------------------------------------------------------- #

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:  # noqa: ARG001
    """
    FastAPI lifespan context manager.

    Handles application startup and shutdown events:
    - **Startup** : Establish MongoDB connection pool.
    - **Shutdown**: Gracefully close the Motor client.

    Parameters
    ----------
    app : FastAPI
        The FastAPI application instance (unused directly but required by signature).
    """
    logger.info("Starting AI Study Assistant backend …")
    await connect_db()
    logger.info("Startup complete. Application is ready.")
    yield
    logger.info("Shutting down AI Study Assistant backend …")
    await close_db()
    logger.info("Shutdown complete.")


# --------------------------------------------------------------------------- #
# Application factory
# --------------------------------------------------------------------------- #

def create_app() -> FastAPI:
    """
    Build and configure the FastAPI application.

    Returns
    -------
    FastAPI
        The fully configured application instance.
    """
    settings = get_settings()

    application = FastAPI(
        title="AI Study Assistant API",
        description=(
            "Backend API for the AI Study Assistant — an intelligent learning platform "
            "that transforms student notes into structured concept maps, explanations, "
            "and practice questions using LLM-powered analysis."
        ),
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ----------------------------------------------------------------------- #
    # CORS Middleware
    # ----------------------------------------------------------------------- #
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ----------------------------------------------------------------------- #
    # Routers
    # ----------------------------------------------------------------------- #
    application.include_router(subjects_router)
    application.include_router(topics_router)
    application.include_router(notes_router)
    application.include_router(maps_router)

    return application


app = create_app()


# --------------------------------------------------------------------------- #
# Health check
# --------------------------------------------------------------------------- #

@app.get(
    "/api/health",
    tags=["Health"],
    summary="Health check",
    response_model=dict,
)
async def health_check() -> dict:
    """
    Lightweight liveness probe for the API server.

    Returns
    -------
    dict
        A JSON object with status ``"ok"`` and basic metadata.
    """
    settings = get_settings()
    return {
        "status": "ok",
        "service": "AI Study Assistant API",
        "version": "1.0.0",
        "database": settings.DB_NAME,
    }
