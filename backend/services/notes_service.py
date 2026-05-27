"""Service for ingesting and retrieving notes."""

import re
from datetime import datetime, timezone

from bson import ObjectId

from db import get_database
from schemas.note import NoteIngest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

COLLECTION = "notes"


def _doc_to_dict(doc: dict) -> dict:
    """Convert a raw MongoDB document to an API-friendly dict.

    Converts ``_id`` ObjectId → ``id`` string.
    """
    doc["id"] = str(doc.pop("_id"))
    return doc


def _clean_text(raw: str) -> str:
    """Apply basic text normalisation to raw note content.

    Steps performed:
    1. Strip leading / trailing whitespace.
    2. Collapse runs of 3+ newlines into exactly two (paragraph break).
    3. Collapse multiple spaces within a line into a single space.
    4. Strip trailing whitespace per line.
    """
    text = raw.strip()
    # Normalise line endings to \\n
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces (but not newlines)
    text = re.sub(r"[^\S\n]+", " ", text)
    # Strip per-line trailing spaces
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    return text


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def ingest_note(data: NoteIngest) -> dict:
    """Clean and store a new note.

    The raw text is preserved as-is; a normalised ``cleaned_text`` version
    is stored alongside it for downstream processing (e.g. LLM prompts).

    Args:
        data: Validated ingestion payload containing ``topic_id`` and
            ``raw_text``.

    Returns:
        The newly created note dict.
    """
    db = get_database()
    cleaned = _clean_text(data.raw_text)
    doc = {
        "topic_id": data.topic_id,
        "raw_text": data.raw_text,
        "cleaned_text": cleaned,
        "version": 1,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_dict(doc)


async def get_notes_by_topic(topic_id: str) -> list[dict]:
    """Return all notes belonging to a topic, newest first.

    Args:
        topic_id: Hex string of the parent topic's ObjectId.

    Returns:
        A list of note dicts.
    """
    db = get_database()
    cursor = db[COLLECTION].find({"topic_id": topic_id}).sort("created_at", -1)
    return [_doc_to_dict(doc) async for doc in cursor]
