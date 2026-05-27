"""Service for generating and retrieving concept mindmaps."""

from datetime import datetime, timezone

from bson import ObjectId

from db import get_database
from services.notes_service import get_notes_by_topic
import llm_client

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

COLLECTION = "mindmaps"


def _doc_to_dict(doc: dict) -> dict:
    """Convert a raw MongoDB document to an API-friendly dict.

    Converts ``_id`` ObjectId → ``id`` string.
    """
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def generate_map(topic_id: str) -> dict:
    """Generate a concept mindmap from all notes under a topic.

    Workflow:
    1. Fetch every note that belongs to ``topic_id``.
    2. Concatenate their ``cleaned_text`` fields into a single context block.
    3. Call the LLM client to produce a structured concept tree.
    4. Persist the resulting mindmap document in MongoDB.
    5. Return the stored document.

    Args:
        topic_id: Hex string of the parent topic's ObjectId.

    Returns:
        The newly created mindmap dict.

    Raises:
        ValueError: If there are no notes for the given topic.
    """
    notes = await get_notes_by_topic(topic_id)
    if not notes:
        raise ValueError(f"No notes found for topic_id={topic_id}")

    # Build combined text from cleaned versions of all notes.
    combined_text = "\n\n---\n\n".join(
        note.get("cleaned_text") or note["raw_text"] for note in notes
    )

    # Ask the LLM to produce a concept-map tree.
    root_node = await llm_client.generate_concept_map(combined_text)

    db = get_database()
    doc = {
        "topic_id": topic_id,
        "root": root_node,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return _doc_to_dict(doc)


async def get_mindmap_by_topic(topic_id: str) -> dict | None:
    """Retrieve the most-recent mindmap for a topic.

    Args:
        topic_id: Hex string of the parent topic's ObjectId.

    Returns:
        The mindmap dict, or ``None`` if none exists for the topic.
    """
    db = get_database()
    doc = await db[COLLECTION].find_one(
        {"topic_id": topic_id},
        sort=[("created_at", -1)],
    )
    if doc is None:
        return None
    return _doc_to_dict(doc)
