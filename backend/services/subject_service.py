"""CRUD service for the ``subjects`` collection."""

from datetime import datetime, timezone

from bson import ObjectId

from db import get_database
from schemas.subject import SubjectCreate, SubjectUpdate

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

COLLECTION = "subjects"


def _doc_to_dict(doc: dict) -> dict:
    """Convert a raw MongoDB document to an API-friendly dict.

    Converts the ``_id`` ObjectId to a plain string stored under the key
    ``id`` so that Pydantic response models can consume it directly.
    """
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def list_subjects() -> list[dict]:
    """Return all subjects sorted by creation date (newest first)."""
    db = get_database()
    cursor = db[COLLECTION].find().sort("created_at", -1)
    return [_doc_to_dict(doc) async for doc in cursor]


async def get_subject(subject_id: str) -> dict | None:
    """Fetch a single subject by its ID.

    Args:
        subject_id: Hex-encoded MongoDB ObjectId string.

    Returns:
        The subject dict, or ``None`` if not found.
    """
    db = get_database()
    try:
        doc = await db[COLLECTION].find_one({"_id": ObjectId(subject_id)})
    except Exception:
        return None
    if doc is None:
        return None
    return _doc_to_dict(doc)


async def create_subject(data: SubjectCreate) -> dict:
    """Insert a new subject document and return it.

    Args:
        data: Validated creation payload.

    Returns:
        The newly created subject dict (including its generated ``id``).
    """
    db = get_database()
    doc = {
        "name": data.name,
        "code": data.code,
        "description": data.description,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_dict(doc)


async def update_subject(subject_id: str, data: SubjectUpdate) -> dict | None:
    """Update an existing subject with the provided (non-None) fields.

    Args:
        subject_id: Hex-encoded MongoDB ObjectId string.
        data: Validated update payload (only set fields are applied).

    Returns:
        The updated subject dict, or ``None`` if the subject was not found.
    """
    db = get_database()
    update_fields = data.model_dump(exclude_unset=True)
    if not update_fields:
        # Nothing to change – just return the current document.
        return await get_subject(subject_id)

    try:
        result = await db[COLLECTION].find_one_and_update(
            {"_id": ObjectId(subject_id)},
            {"$set": update_fields},
            return_document=True,
        )
    except Exception:
        return None

    if result is None:
        return None
    return _doc_to_dict(result)


async def delete_subject(subject_id: str) -> bool:
    """Delete a subject by ID.

    Args:
        subject_id: Hex-encoded MongoDB ObjectId string.

    Returns:
        ``True`` if a document was deleted, ``False`` otherwise.
    """
    db = get_database()
    try:
        result = await db[COLLECTION].delete_one({"_id": ObjectId(subject_id)})
    except Exception:
        return False
    return result.deleted_count > 0
