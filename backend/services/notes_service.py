"""
services/notes_service.py
-------------------------
Business logic for Note ingestion and retrieval.

Text cleaning is performed in the service layer before persistence so that
the LLM and mind-map pipeline always work with normalised input.
"""

from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import List

from bson import ObjectId

from db import get_database
from schemas.note import NoteIngest

COLLECTION = "notes"


def _serialize(doc: dict) -> dict:
    """Serialise a raw Motor document: replace ``_id`` ObjectId with ``id`` str."""
    doc["id"] = str(doc.pop("_id"))
    return doc


def _clean_text(raw: str) -> str:
    """
    Apply basic text normalisation to raw student input.

    Steps applied (in order):
    1. Strip leading/trailing whitespace from the full document.
    2. Normalise Windows/classic Mac line-endings to Unix ``\\n``.
    3. Collapse runs of 3+ consecutive blank lines into two blank lines.
    4. Strip trailing whitespace from every individual line.
    5. Collapse multiple spaces (but not newlines) to a single space per line.

    Parameters
    ----------
    raw : str
        The original user-submitted text.

    Returns
    -------
    str
        The normalised text string.
    """
    text = raw.strip()
    # Normalise line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Strip trailing whitespace per line
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    # Collapse runs of inline multiple spaces
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Collapse 3+ consecutive blank lines → 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


async def ingest_note(data: NoteIngest) -> dict:
    """
    Clean and persist a new Note document for a Topic.

    The service:
    1. Applies ``_clean_text()`` to produce ``cleaned_text``.
    2. Determines the next version number for this topic.
    3. Inserts the document and returns the serialised result.

    Parameters
    ----------
    data : NoteIngest
        Validated ingestion payload containing ``topic_id`` and ``raw_text``.

    Returns
    -------
    dict
        The newly inserted Note document with ``id``.
    """
    db = get_database()

    cleaned = _clean_text(data.raw_text)

    # Calculate next version for this topic
    existing_count = await db[COLLECTION].count_documents({"topic_id": data.topic_id})
    version = existing_count + 1

    document = {
        "topic_id": data.topic_id,
        "raw_text": data.raw_text,
        "cleaned_text": cleaned,
        "version": version,
        "created_at": datetime.now(timezone.utc),
    }

    result = await db[COLLECTION].insert_one(document)
    document["_id"] = result.inserted_id
    return _serialize(document)


async def get_notes_by_topic(topic_id: str) -> List[dict]:
    """
    Retrieve all Notes for a given Topic, ordered by version ascending.

    Parameters
    ----------
    topic_id : str
        The string ID of the parent Topic document.

    Returns
    -------
    List[dict]
        List of serialised Note documents.
    """
    db = get_database()
    cursor = db[COLLECTION].find({"topic_id": topic_id}).sort("version", 1)
    return [_serialize(doc) async for doc in cursor]
