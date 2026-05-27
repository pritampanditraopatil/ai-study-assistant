"""
services/map_service.py
-----------------------
Business logic for Mind-map generation and retrieval.

The service:
1. Fetches all cleaned notes for a Topic.
2. Concatenates them into a single context string.
3. Delegates LLM inference to ``llm_client.generate_concept_map()``.
4. Persists the result in the ``mindmaps`` collection (upsert by topic_id).
5. Returns the serialised mindmap document.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

import llm_client
from db import get_database
from services.notes_service import get_notes_by_topic

COLLECTION = "mindmaps"


def _serialize(doc: dict) -> dict:
    """Serialise a raw Motor document: replace ``_id`` ObjectId with ``id`` str."""
    doc["id"] = str(doc.pop("_id"))
    return doc


async def generate_map(topic_id: str) -> dict:
    """
    Generate (or regenerate) a mind-map for a Topic from its ingested notes.

    Workflow
    --------
    1. Load all notes for ``topic_id`` from the ``notes`` collection.
    2. Concatenate ``cleaned_text`` fields (falling back to ``raw_text``).
    3. Call ``llm_client.generate_concept_map()`` with the combined text.
    4. Upsert the result into the ``mindmaps`` collection keyed by ``topic_id``.

    Parameters
    ----------
    topic_id : str
        The string ID of the parent Topic whose notes will be mapped.

    Returns
    -------
    dict
        Serialised MindmapModel document including the generated tree.

    Raises
    ------
    ValueError
        If no notes are found for the given ``topic_id``.
    """
    db = get_database()

    # --- 1. Fetch all notes ---
    notes = await get_notes_by_topic(topic_id)
    if not notes:
        raise ValueError(f"No notes found for topic_id='{topic_id}'. Ingest notes first.")

    # --- 2. Combine text ---
    parts = []
    for note in notes:
        text = note.get("cleaned_text") or note.get("raw_text", "")
        if text:
            parts.append(text)
    combined_text = "\n\n---\n\n".join(parts)

    # --- 3. LLM call ---
    mindmap_tree: dict = await llm_client.generate_concept_map(combined_text)

    # --- 4. Upsert into mindmaps collection ---
    now = datetime.now(timezone.utc)
    document = {
        "topic_id": topic_id,
        "root": mindmap_tree,
        "created_at": now,
    }

    result = await db[COLLECTION].find_one_and_update(
        {"topic_id": topic_id},
        {"$set": document},
        upsert=True,
        return_document=True,  # motor uses True for AFTER
    )

    if result is None:
        # Fallback: fetch freshly inserted document
        result = await db[COLLECTION].find_one({"topic_id": topic_id})

    return _serialize(result)


async def get_mindmap_by_topic(topic_id: str) -> Optional[dict]:
    """
    Retrieve the most recently generated Mind-map for a Topic.

    Parameters
    ----------
    topic_id : str
        The string ID of the parent Topic.

    Returns
    -------
    Optional[dict]
        Serialised MindmapModel document, or ``None`` if no map exists yet.
    """
    db = get_database()
    doc = await db[COLLECTION].find_one({"topic_id": topic_id})
    return _serialize(doc) if doc else None
