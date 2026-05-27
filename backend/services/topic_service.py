"""CRUD service for the ``topics`` collection."""

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from db import get_database
from schemas.topic import TopicCreate, TopicUpdate

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

COLLECTION = "topics"


def _doc_to_dict(doc: dict) -> dict:
    """Convert a raw MongoDB document to an API-friendly dict.

    Converts ``_id`` ObjectId → ``id`` string.
    """
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def list_topics(subject_id: Optional[str] = None) -> list[dict]:
    """Return topics, optionally filtered by ``subject_id``.

    Args:
        subject_id: If provided, only topics belonging to this subject are
            returned.  Otherwise all topics are returned.

    Returns:
        A list of topic dicts sorted newest-first.
    """
    db = get_database()
    query: dict = {}
    if subject_id is not None:
        query["subject_id"] = subject_id
    cursor = db[COLLECTION].find(query).sort("created_at", -1)
    return [_doc_to_dict(doc) async for doc in cursor]


async def get_topic(topic_id: str) -> dict | None:
    """Fetch a single topic by ID.

    Returns:
        The topic dict or ``None`` if not found / invalid ID.
    """
    db = get_database()
    try:
        doc = await db[COLLECTION].find_one({"_id": ObjectId(topic_id)})
    except Exception:
        return None
    if doc is None:
        return None
    return _doc_to_dict(doc)


async def create_topic(data: TopicCreate) -> dict:
    """Insert a new topic and return it.

    Args:
        data: Validated creation payload.

    Returns:
        The newly created topic dict.
    """
    db = get_database()
    doc = {
        "subject_id": data.subject_id,
        "title": data.title,
        "description": data.description,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_dict(doc)


async def update_topic(topic_id: str, data: TopicUpdate) -> dict | None:
    """Update an existing topic with non-None fields.

    Returns:
        Updated topic dict or ``None`` if not found.
    """
    db = get_database()
    update_fields = data.model_dump(exclude_unset=True)
    if not update_fields:
        return await get_topic(topic_id)

    try:
        result = await db[COLLECTION].find_one_and_update(
            {"_id": ObjectId(topic_id)},
            {"$set": update_fields},
            return_document=True,
        )
    except Exception:
        return None

    if result is None:
        return None
    return _doc_to_dict(result)


async def delete_topic(topic_id: str) -> bool:
    """Delete a topic by ID.

    Returns:
        ``True`` if a document was deleted, ``False`` otherwise.
    """
    db = get_database()
    try:
        result = await db[COLLECTION].delete_one({"_id": ObjectId(topic_id)})
    except Exception:
        return False
    return result.deleted_count > 0
