"""
services/subject_service.py
---------------------------
Business logic for Subject CRUD operations.

All functions are ``async`` and communicate with MongoDB via Motor.
ObjectId conversion (BSON ↔ str) is handled here so that callers
receive plain Python dicts with string IDs.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from bson.errors import InvalidId

from db import get_database
from schemas.subject import SubjectCreate, SubjectUpdate

COLLECTION = "subjects"


def _oid(id_str: str) -> ObjectId:
    """
    Convert a string to a BSON ObjectId.

    Parameters
    ----------
    id_str : str
        Hexadecimal MongoDB document ID.

    Raises
    ------
    ValueError
        If ``id_str`` is not a valid ObjectId hex string.

    Returns
    -------
    ObjectId
        The corresponding BSON ObjectId.
    """
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError) as exc:
        raise ValueError(f"Invalid ObjectId: '{id_str}'") from exc


def _serialize(doc: dict) -> dict:
    """
    Serialise a raw MongoDB document for API consumption.

    Converts ``_id`` (ObjectId) to the string key ``id``.

    Parameters
    ----------
    doc : dict
        Raw document returned by Motor.

    Returns
    -------
    dict
        Document with ``_id`` replaced by ``id`` (str).
    """
    doc["id"] = str(doc.pop("_id"))
    return doc


async def list_subjects() -> List[dict]:
    """
    Retrieve all Subject documents from MongoDB.

    Returns
    -------
    List[dict]
        List of serialised Subject documents sorted by creation date.
    """
    db = get_database()
    cursor = db[COLLECTION].find().sort("created_at", 1)
    return [_serialize(doc) async for doc in cursor]


async def get_subject(subject_id: str) -> Optional[dict]:
    """
    Retrieve a single Subject by its ID.

    Parameters
    ----------
    subject_id : str
        The string representation of the MongoDB ObjectId.

    Returns
    -------
    Optional[dict]
        Serialised Subject document, or ``None`` if not found.
    """
    db = get_database()
    doc = await db[COLLECTION].find_one({"_id": _oid(subject_id)})
    return _serialize(doc) if doc else None


async def create_subject(data: SubjectCreate) -> dict:
    """
    Insert a new Subject document.

    Parameters
    ----------
    data : SubjectCreate
        Validated creation payload.

    Returns
    -------
    dict
        The newly created Subject document (including ``id``).
    """
    db = get_database()
    document = {
        "name": data.name,
        "code": data.code,
        "description": data.description,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(document)
    document["_id"] = result.inserted_id
    return _serialize(document)


async def update_subject(subject_id: str, data: SubjectUpdate) -> Optional[dict]:
    """
    Partially update a Subject document.

    Only fields explicitly set in ``data`` are written to MongoDB (``$set``).

    Parameters
    ----------
    subject_id : str
        Target document ID.
    data : SubjectUpdate
        Fields to update; ``None`` values are excluded.

    Returns
    -------
    Optional[dict]
        Updated Subject document, or ``None`` if not found.
    """
    db = get_database()
    updates = data.model_dump(exclude_none=True)
    if not updates:
        # Nothing to update — return the existing document
        return await get_subject(subject_id)

    await db[COLLECTION].update_one({"_id": _oid(subject_id)}, {"$set": updates})
    return await get_subject(subject_id)


async def delete_subject(subject_id: str) -> bool:
    """
    Delete a Subject document by ID.

    Parameters
    ----------
    subject_id : str
        Target document ID.

    Returns
    -------
    bool
        ``True`` if a document was deleted, ``False`` if not found.
    """
    db = get_database()
    result = await db[COLLECTION].delete_one({"_id": _oid(subject_id)})
    return result.deleted_count > 0
