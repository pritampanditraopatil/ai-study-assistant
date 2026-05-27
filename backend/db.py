"""MongoDB connection management using Motor (async driver).

Provides helpers to open / close the client and to obtain the database handle
that the rest of the application depends on.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

# ── Module-level state ───────────────────────────────────────────────────────
_client: AsyncIOMotorClient | None = None
_database: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    """Create the Motor client and pin the database reference.

    Called once during application startup (lifespan).
    """
    global _client, _database
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.MONGO_URI)
    _database = _client[settings.DB_NAME]


async def close_db() -> None:
    """Gracefully close the Motor client.

    Called once during application shutdown (lifespan).
    """
    global _client, _database
    if _client is not None:
        _client.close()
        _client = None
        _database = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the current database handle.

    Raises:
        RuntimeError: If called before ``connect_db()`` has been awaited.
    """
    if _database is None:
        raise RuntimeError(
            "Database is not initialised. "
            "Ensure connect_db() is called during application startup."
        )
    return _database
