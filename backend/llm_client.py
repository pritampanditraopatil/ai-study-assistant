"""LLM client for AI Study Assistant.

Every language-model interaction should go through this module. For this
iteration, concept-map generation is wired to Gemini's REST API. Explanations,
questions, and chat remain mock-backed with prompt templates ready for the next
vertical slices.
"""

from __future__ import annotations

import json
import re
from typing import Any

import httpx
from pydantic import ValidationError

from config import get_settings
from schemas.mindmap import MindmapNode


class LLMClientError(RuntimeError):
    """Raised when the configured LLM call or response parsing fails."""


# ---------------------------------------------------------------------------
# Prompt templates
# ---------------------------------------------------------------------------

CONCEPT_MAP_PROMPT = """\
<INSTRUCTIONS>
Create an understanding-first concept map for Indian CSE students.
Use only the notes provided. Preserve important CS terms, but keep summaries
simple and useful for learning.

Return only valid JSON. Do not include markdown fences or commentary.
</INSTRUCTIONS>

<OUTPUT_FORMAT>
{{
  "id": "root",
  "title": "short topic title",
  "summary": "1-2 sentence overview of the topic",
  "children": [
    {{
      "id": "unique-node-id",
      "title": "short concept label",
      "summary": "1-2 sentence explanation",
      "children": []
    }}
  ]
}}
</OUTPUT_FORMAT>

<QUALITY_BAR>
- Build a hierarchy: root -> major concepts -> supporting sub-concepts.
- Prefer 3-7 major child nodes under the root.
- Use stable, lowercase node ids with hyphens, such as "deadlock-conditions".
- Avoid exam-mark phrasing such as 2M, 5M, or 10M.
</QUALITY_BAR>

<NOTES>
{notes_text}
</NOTES>
"""

EXPLANATIONS_PROMPT = """\
<INSTRUCTIONS>
Explain every node in the mindmap for a CSE student who wants understanding,
not memorized exam answers.
</INSTRUCTIONS>

<OUTPUT_FORMAT>
{{
  "node-id": {{
    "explanation": "simple explanation",
    "misconceptions": ["common wrong idea"],
    "code_example": "optional short code example"
  }}
}}
</OUTPUT_FORMAT>

<MINDMAP>
{mindmap_json}
</MINDMAP>
"""

QUESTIONS_PROMPT = """\
<INSTRUCTIONS>
Generate understanding-focused practice questions from the mindmap and
explanations. Include easy, medium, and hard questions. Do not use marks-based
exam labels.
</INSTRUCTIONS>

<OUTPUT_FORMAT>
{{
  "node-id": [
    {{
      "question": "question text",
      "difficulty": "easy | medium | hard",
      "type": "conceptual | comparison | scenario | code",
      "answer": "concise answer"
    }}
  ]
}}
</OUTPUT_FORMAT>

<MINDMAP>
{mindmap_json}
</MINDMAP>
"""

CHAT_PROMPT = """\
<INSTRUCTIONS>
You are a context-bound tutor. Answer from the provided topic context. If the
notes do not support an answer, say that clearly and suggest what to add.
Guide the student step by step before giving full answers.
</INSTRUCTIONS>

<CONTEXT>
{context_json}
</CONTEXT>

<STUDENT_MESSAGE>
{user_message}
</STUDENT_MESSAGE>
"""


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

PLACEHOLDER_KEYS = {"", "your-key-here", "your-gemini-api-key"}


def _build_gemini_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Convert the internal prompt payload into Gemini generateContent JSON."""
    if "contents" in payload:
        return payload

    prompt = payload.get("prompt")
    if not isinstance(prompt, str) or not prompt.strip():
        raise LLMClientError("LLM payload must include a non-empty prompt.")

    generation_config: dict[str, Any] = {
        "temperature": payload.get("temperature", 0.2),
        "maxOutputTokens": payload.get("max_tokens", 2500),
        "responseMimeType": payload.get("response_mime_type", "application/json"),
    }

    return {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": generation_config,
    }


async def _call_llm(payload: dict[str, Any]) -> dict[str, Any]:
    """POST a Gemini request to the configured LLM endpoint."""
    settings = get_settings()
    api_key = settings.LLM_API_KEY.strip()

    if api_key in PLACEHOLDER_KEYS:
        raise LLMClientError("LLM_API_KEY is not configured for Gemini.")

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0)) as client:
            response = await client.post(
                settings.LLM_API_URL,
                headers=headers,
                json=_build_gemini_payload(payload),
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as exc:
        detail = _extract_error_detail(exc.response)
        raise LLMClientError(
            f"Gemini request failed with status {exc.response.status_code}: {detail}"
        ) from exc
    except httpx.HTTPError as exc:
        raise LLMClientError("Gemini request failed before a response was received.") from exc
    except ValueError as exc:
        raise LLMClientError("Gemini returned a non-JSON response.") from exc


def _extract_error_detail(response: httpx.Response) -> str:
    """Return a short, safe error message from a failed Gemini response."""
    try:
        body = response.json()
    except ValueError:
        return response.text[:300] or "No response body."

    error = body.get("error")
    if isinstance(error, dict):
        return str(error.get("message") or error.get("status") or body)[:300]
    return str(body)[:300]


def _extract_llm_text(response: dict[str, Any]) -> str:
    """Extract text from Gemini, OpenAI-like, or direct JSON responses."""
    if {"id", "title", "summary", "children"}.issubset(response):
        return json.dumps(response)

    candidates = response.get("candidates")
    if isinstance(candidates, list) and candidates:
        first = candidates[0]
        content = first.get("content", {}) if isinstance(first, dict) else {}
        parts = content.get("parts", []) if isinstance(content, dict) else []
        texts = [
            part["text"]
            for part in parts
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ]
        if texts:
            return "".join(texts)

        finish_reason = first.get("finishReason") if isinstance(first, dict) else None
        raise LLMClientError(
            f"Gemini response did not include text. finishReason={finish_reason}"
        )

    choices = response.get("choices")
    if isinstance(choices, list) and choices:
        first = choices[0]
        if isinstance(first, dict):
            message = first.get("message", {})
            if isinstance(message, dict) and isinstance(message.get("content"), str):
                return message["content"]
            if isinstance(first.get("text"), str):
                return first["text"]

    if isinstance(response.get("output_text"), str):
        return response["output_text"]
    if isinstance(response.get("text"), str):
        return response["text"]

    prompt_feedback = response.get("promptFeedback") or response.get("prompt_feedback")
    if prompt_feedback:
        raise LLMClientError(f"Gemini response was blocked or empty: {prompt_feedback}")
    raise LLMClientError("LLM response did not include generated text.")


def _load_json_object(text: str) -> dict[str, Any]:
    """Parse the first JSON object from model text."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise LLMClientError("LLM response did not contain a JSON object.")

    try:
        parsed = json.loads(cleaned[start : end + 1])
    except json.JSONDecodeError as exc:
        raise LLMClientError("LLM response was not valid JSON.") from exc

    if not isinstance(parsed, dict):
        raise LLMClientError("LLM response JSON must be an object.")
    return parsed


def _safe_node_id(value: str, fallback: str) -> str:
    """Convert a model-provided node id into a stable UI-safe id."""
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:60] or fallback


def _dedupe_node_ids(root: dict[str, Any]) -> dict[str, Any]:
    """Ensure node ids are unique after schema validation."""
    seen: dict[str, int] = {}

    def walk(node: dict[str, Any], fallback: str) -> None:
        base = _safe_node_id(str(node.get("id") or node.get("title") or ""), fallback)
        count = seen.get(base, 0)
        seen[base] = count + 1
        node["id"] = base if count == 0 else f"{base}-{count + 1}"

        children = node.get("children") or []
        for index, child in enumerate(children, start=1):
            walk(child, f"{node['id']}-{index}")

    walk(root, "root")
    return root


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


async def generate_concept_map(notes_text: str) -> dict[str, Any]:
    """Generate a validated concept-map tree from raw notes using Gemini."""
    if not notes_text.strip():
        raise ValueError("notes_text cannot be empty")

    prompt = CONCEPT_MAP_PROMPT.format(notes_text=notes_text.strip())
    response = await _call_llm(
        {
            "prompt": prompt,
            "temperature": 0.2,
            "max_tokens": 2500,
            "response_mime_type": "application/json",
        }
    )
    data = _load_json_object(_extract_llm_text(response))

    try:
        root = MindmapNode.model_validate(data).model_dump()
    except ValidationError as exc:
        raise LLMClientError("Gemini concept map did not match the mindmap schema.") from exc

    return _dedupe_node_ids(root)


async def generate_explanations(mindmap: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Mock explanations for every node until the study slice is implemented.

    Later this should call Gemini with ``EXPLANATIONS_PROMPT`` and return:
    node_id -> { explanation, misconceptions[], code_example? }.
    """
    root = mindmap.get("root", {})
    result: dict[str, dict[str, Any]] = {}

    def walk(node: dict[str, Any]) -> None:
        node_id = node.get("id", "unknown")
        title = node.get("title", "this concept")
        result[node_id] = {
            "explanation": (
                f"This section covers '{title}'. {node.get('summary', '')} "
                "It connects to the larger topic through the way the core idea "
                "supports understanding, debugging, or comparing CS systems."
            ),
            "misconceptions": [
                f"A common misconception is that '{title}' can be memorized alone.",
                "Students often miss how this concept connects to nearby ideas.",
            ],
        }
        for child in node.get("children", []):
            walk(child)

    walk(root)
    return result


async def generate_questions(mindmap: dict[str, Any]) -> dict[str, list[dict[str, str]]]:
    """Mock understanding questions until the questions slice is implemented.

    Later this should call Gemini with ``QUESTIONS_PROMPT`` and return:
    node_id -> [{ question, difficulty, type, answer }].
    """
    root = mindmap.get("root", {})
    result: dict[str, list[dict[str, str]]] = {}

    def walk(node: dict[str, Any]) -> None:
        node_id = node.get("id", "unknown")
        title = node.get("title", "this concept")
        result[node_id] = [
            {
                "question": f"Explain '{title}' in your own words.",
                "difficulty": "easy",
            },
            {
                "question": f"How does '{title}' connect to the parent topic?",
                "difficulty": "medium",
            },
            {
                "question": f"Describe a scenario where misunderstanding '{title}' causes a bug.",
                "difficulty": "hard",
            },
        ]
        for child in node.get("children", []):
            walk(child)

    walk(root)
    return result


async def chat_with_topic(context: dict[str, Any], user_message: str) -> str:
    """Mock context-bound tutor chat until the chat slice is implemented.

    Later this should call Gemini with ``CHAT_PROMPT`` and answer only from the
    supplied context, preferring "not in notes" over unsupported claims.
    """
    topic_title = context.get("topic_title", "this topic")
    return (
        f"Great question about '{topic_title}'. Your message was: \"{user_message}\". "
        "For now, chat is still using the mock tutor response. Once wired to the "
        "topic context, I will guide you step by step from your notes."
    )
