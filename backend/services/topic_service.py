"""
services/topic_service.py
-------------------------
Business logic for Topic CRUD operations.

Supports optional filtering by ``subject_id`` when listing topics.
All functions are async and use Motor for MongoDB access.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId

from db import get_database
from schemas.topic import TopicCreate, TopicUpdate

COLLECTION = "topics"


def _oid(id_str: str) -> ObjectId:
    """
    Convert a string to a BSON ObjectId.

    Raises
    ------
    ValueError
        If ``id_str`` is not a valid ObjectId hex string.
    """
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError) as exc:
        raise ValueError(f"Invalid ObjectId: '{id_str}'") from exc


def _serialize(doc: dict) -> dict:
    """Serialise a raw Motor document: replace ``_id`` ObjectId with ``id`` str."""
    doc["id"] = str(doc.pop("_id"))
    return doc


async def list_topics(subject_id: Optional[str] = None) -> List[dict]:
    """
    Retrieve Topic documents, with an optional subject filter.

    Parameters
    ----------
    subject_id : Optional[str]
        If provided, only topics belonging to this Subject are returned.

    Returns
    -------
    List[dict]
        Serialised Topic documents sorted by creation date (ascending).
    """
    db = get_database()
    query: dict = {}
    if subject_id:
        query["subject_id"] = subject_id
    cursor = db[COLLECTION].find(query).sort("created_at", 1)
    return [_serialize(doc) async for doc in cursor]


async def get_topic(topic_id: str) -> Optional[dict]:
    """
    Retrieve a single Topic by its ID.

    Parameters
    ----------
    topic_id : str
        The string representation of the MongoDB ObjectId.

    Returns
    -------
    Optional[dict]
        Serialised Topic document, or ``None`` if not found.
    """
    db = get_database()
    doc = await db[COLLECTION].find_one({"_id": _oid(topic_id)})
    return _serialize(doc) if doc else None


async def create_topic(data: TopicCreate) -> dict:
    """
    Insert a new Topic document.

    Parameters
    ----------
    data : TopicCreate
        Validated creation payload (includes ``subject_id``).

    Returns
    -------
    dict
        The newly inserted Topic document with ``id``.
    """
    db = get_database()
    document = {
        "subject_id": data.subject_id,
        "title": data.title,
        "description": data.description,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(document)
    document["_id"] = result.inserted_id
    return _serialize(document)


async def update_topic(topic_id: str, data: TopicUpdate) -> Optional[dict]:
    """
    Partially update a Topic document.

    Parameters
    ----------
    topic_id : str
        Target document ID.
    data : TopicUpdate
        Fields to update; ``None`` values are excluded.

    Returns
    -------
    Optional[dict]
        Updated Topic document, or ``None`` if not found.
    """
    db = get_database()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        return await get_topic(topic_id)

    await db[COLLECTION].update_one({"_id": _oid(topic_id)}, {"$set": updates})
    return await get_topic(topic_id)


async def delete_topic(topic_id: str) -> bool:
    """
    Delete a Topic document by ID.

    Parameters
    ----------
    topic_id : str
        Target document ID.

    Returns
    -------
    bool
        ``True`` if deleted, ``False`` if not found.
    """
    db = get_database()
    result = await db[COLLECTION].delete_one({"_id": _oid(topic_id)})
    return result.deleted_count > 0
