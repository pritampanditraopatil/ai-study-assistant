"""
db.py
-----
Motor (async MongoDB) client setup and lifecycle helpers.

Usage
-----
Call ``connect_db()`` on application startup and ``close_db()`` on shutdown.
Retrieve the database handle anywhere via ``get_database()``.
"""

from __future__ import annotations

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

logger = logging.getLogger(__name__)

# Module-level references kept alive for the duration of the process
_client: Optional[AsyncIOMotorClient] = None  # type: ignore[type-arg]
_database: Optional[AsyncIOMotorDatabase] = None  # type: ignore[type-arg]


async def connect_db() -> None:
    """
    Initialise the Motor client and bind it to the configured database.

    Should be called once during application startup (e.g., inside the
    FastAPI lifespan context manager).
    """
    global _client, _database  # noqa: PLW0603

    settings = get_settings()
    logger.info("Connecting to MongoDB at %s …", settings.MONGO_URI)

    _client = AsyncIOMotorClient(settings.MONGO_URI)
    _database = _client[settings.DB_NAME]

    # Ping to validate the connection early
    await _client.admin.command("ping")
    logger.info("MongoDB connection established – database: '%s'", settings.DB_NAME)


async def close_db() -> None:
    """
    Close the Motor client connection pool.

    Should be called once during application shutdown.
    """
    global _client  # noqa: PLW0603

    if _client is not None:
        _client.close()
        logger.info("MongoDB connection closed.")
        _client = None


def get_database() -> AsyncIOMotorDatabase:  # type: ignore[type-arg]
    """
    Return the active Motor database handle.

    Raises
    ------
    RuntimeError
        If ``connect_db()`` has not been called yet.

    Returns
    -------
    AsyncIOMotorDatabase
        The database bound to the name in settings.
    """
    if _database is None:
        raise RuntimeError(
            "Database is not initialised. Ensure connect_db() is called on startup."
        )
    return _database
