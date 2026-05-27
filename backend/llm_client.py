"""
llm_client.py
-------------
Centralised gateway for all Large Language Model interactions.

All LLM calls in the application MUST go through this module.
No route handler or service may import ``httpx`` or call an external
inference endpoint directly.

Architecture
------------
Each public function in this module:
  1. Builds a structured prompt from a module-level template constant.
  2. Sends the request to the configured LLM endpoint via ``httpx``.
  3. Parses and validates the JSON response.
  4. Returns a typed Python dict for the caller.

Until a real LLM backend is connected, every function returns rich **mock
data** so the rest of the API stack works end-to-end without an active model.

Prompting Strategy
------------------
Prompts follow Anthropic-style XML structuring:
  - ``<system>`` block sets role and output format constraints.
  - ``<context>`` block injects dynamic content (e.g. notes text).
  - ``<instruction>`` block states the precise task.
  - ``<output_format>`` block specifies exact JSON schema expected.

This makes prompt intent explicit, reduces hallucination, and simplifies
output parsing.
"""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from config import get_settings

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Prompt template constants
# --------------------------------------------------------------------------- #

_CONCEPT_MAP_PROMPT = """
<system>
You are an expert academic tutor specialising in concept mapping and knowledge
synthesis. Your task is to transform student notes into a hierarchical concept
map represented as a JSON tree.
</system>

<context>
{notes_text}
</context>

<instruction>
Analyse the notes above and produce a concept map that:
1. Identifies the single most important overarching concept as the root node.
2. Groups related sub-concepts under the root.
3. Provides a clear 1-3 sentence summary for every node.
4. Limits depth to 3 levels (root → children → grandchildren).
5. Assigns each node a unique kebab-case `id`.
</instruction>

<output_format>
Return ONLY a valid JSON object with this exact structure (no markdown fences):
{{
  "id": "root-concept-id",
  "title": "Root Concept Title",
  "summary": "Brief summary of the root concept.",
  "children": [
    {{
      "id": "child-id",
      "title": "Child Concept",
      "summary": "Summary.",
      "children": []
    }}
  ]
}}
</output_format>
"""

_EXPLANATIONS_PROMPT = """
<system>
You are a Socratic tutor. For each concept node provided, generate a detailed
explanation and identify common student misconceptions.
</system>

<context>
{mindmap_json}
</context>

<instruction>
For every node `id` in the mind-map, produce:
  - `explanation`: A thorough 3-5 sentence explanation of the concept.
  - `misconceptions`: A list of 2-3 common student misconceptions as strings.
Return a flat JSON object keyed by node id.
</instruction>

<output_format>
{{
  "node-id": {{
    "explanation": "...",
    "misconceptions": ["...", "..."]
  }}
}}
</output_format>
"""

_QUESTIONS_PROMPT = """
<system>
You are an experienced exam-setter. Generate practice questions for each
concept node in the provided mind-map.
</system>

<context>
{mindmap_json}
</context>

<instruction>
For each node `id`, generate 3 questions of varying difficulty:
  1. A recall/definition question.
  2. A comprehension/application question.
  3. A higher-order analysis or evaluation question.
Return a flat JSON object keyed by node id, each value being a list of strings.
</instruction>

<output_format>
{{
  "node-id": ["Question 1?", "Question 2?", "Question 3?"]
}}
</output_format>
"""

_CHAT_PROMPT = """
<system>
You are a friendly, knowledgeable AI tutor helping a student understand their
study material. Use the provided concept map and topic context to give accurate,
encouraging answers. Avoid unnecessary jargon. Always relate your answer back
to concepts in the provided mind-map when relevant.
</system>

<context>
{context_json}
</context>

<instruction>
Respond to the following student question in a conversational but precise way
(3-6 sentences). If the question is outside the scope of the context, politely
say so and suggest what related concept might help.

Student question: {user_message}
</instruction>
"""


# --------------------------------------------------------------------------- #
# Internal HTTP helper
# --------------------------------------------------------------------------- #

async def _call_llm(prompt: str) -> str:
    """
    Send a prompt to the configured LLM endpoint and return the text response.

    Parameters
    ----------
    prompt : str
        The fully rendered prompt string to send.

    Returns
    -------
    str
        The model's text completion.

    Raises
    ------
    httpx.HTTPStatusError
        If the upstream LLM API returns a non-2xx status.
    """
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "default",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 4096,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(settings.LLM_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #

async def generate_concept_map(notes_text: str) -> dict:
    """
    Transform a block of student notes into a hierarchical concept map tree.

    Input Format
    ------------
    ``notes_text`` : Combined cleaned text from one or more Note documents,
    separated by ``\\n\\n---\\n\\n`` delimiters.  May contain structured or
    unstructured prose.

    Expected Output Format
    ----------------------
    A nested Python dict representing the concept tree::

        {
          "id": "root-id",
          "title": "Root Concept",
          "summary": "Summary text.",
          "children": [
            {
              "id": "child-id",
              "title": "Child",
              "summary": "...",
              "children": [...]
            }
          ]
        }

    Prompting Strategy
    ------------------
    - Single-pass generation: ask the model to produce a complete tree in one
      response to minimise latency.
    - XML-delimited prompt sections reduce role confusion.
    - Low temperature (0.3) favours factual, structured output.
    - Output-format section with a concrete JSON schema example minimises
      parsing failures.

    TODO
    ----
    - Replace mock return with ``await _call_llm(...)`` and JSON parse.
    - Add retry logic for transient network errors.
    - Validate returned JSON against MindmapNode schema before returning.

    Parameters
    ----------
    notes_text : str
        The full combined text from cleaned notes.

    Returns
    -------
    dict
        Concept map tree dict (compatible with ``MindmapNodeModel``).
    """
    # TODO: replace with real LLM call
    # prompt = _CONCEPT_MAP_PROMPT.format(notes_text=notes_text)
    # raw = await _call_llm(prompt)
    # return json.loads(raw)

    logger.info("generate_concept_map called (mock). Notes length=%d chars.", len(notes_text))

    # --- MOCK RESPONSE ---
    return {
        "id": "root",
        "title": "Core Concepts Overview",
        "summary": (
            "This mind-map summarises the key concepts extracted from the "
            "student's notes. Explore the child nodes for deeper detail."
        ),
        "children": [
            {
                "id": "concept-1",
                "title": "Fundamental Principles",
                "summary": (
                    "The foundational ideas that underpin the entire subject area. "
                    "Understanding these is essential before progressing to advanced topics."
                ),
                "children": [
                    {
                        "id": "concept-1-1",
                        "title": "Definition & Scope",
                        "summary": "Establishes what the subject covers and its boundaries.",
                        "children": [],
                    },
                    {
                        "id": "concept-1-2",
                        "title": "Historical Context",
                        "summary": "How the field evolved and key milestones in its development.",
                        "children": [],
                    },
                ],
            },
            {
                "id": "concept-2",
                "title": "Key Mechanisms",
                "summary": (
                    "The primary processes and algorithms that drive the subject. "
                    "These form the operational core of the discipline."
                ),
                "children": [
                    {
                        "id": "concept-2-1",
                        "title": "Core Algorithm / Process",
                        "summary": "Step-by-step description of the primary mechanism.",
                        "children": [],
                    },
                    {
                        "id": "concept-2-2",
                        "title": "Edge Cases & Exceptions",
                        "summary": "Scenarios where standard behaviour does not apply.",
                        "children": [],
                    },
                ],
            },
            {
                "id": "concept-3",
                "title": "Practical Applications",
                "summary": (
                    "Real-world uses of the concepts covered in the notes, linking "
                    "theory to practice."
                ),
                "children": [
                    {
                        "id": "concept-3-1",
                        "title": "Industry Use Cases",
                        "summary": "How professionals apply these concepts day-to-day.",
                        "children": [],
                    },
                ],
            },
        ],
    }


async def generate_explanations(mindmap: dict) -> dict[str, dict]:
    """
    Generate detailed explanations and common misconceptions for each concept node.

    Input Format
    ------------
    ``mindmap`` : The full concept map dict returned by ``generate_concept_map``,
    including the entire nested tree.

    Expected Output Format
    ----------------------
    A flat dict keyed by node ``id``::

        {
          "node-id": {
            "explanation": "3-5 sentence explanation ...",
            "misconceptions": ["Misconception 1", "Misconception 2"]
          }
        }

    Prompting Strategy
    ------------------
    - The full mindmap JSON is injected into the context block.
    - The model is asked to flatten the tree into a keyed response to simplify
      client-side lookup by node id.
    - Misconceptions are requested as a list to enable UI-level highlight features.

    TODO
    ----
    - Replace mock with real LLM call.
    - Parse and validate each node's explanation/misconceptions list.

    Parameters
    ----------
    mindmap : dict
        The concept map dict (from ``generate_concept_map``).

    Returns
    -------
    dict[str, dict]
        Explanations keyed by node id.
    """
    # TODO: replace with real LLM call
    # prompt = _EXPLANATIONS_PROMPT.format(mindmap_json=json.dumps(mindmap, indent=2))
    # raw = await _call_llm(prompt)
    # return json.loads(raw)

    logger.info("generate_explanations called (mock).")

    # --- MOCK RESPONSE ---
    return {
        "root": {
            "explanation": (
                "The root concept provides a high-level overview of the entire topic. "
                "It acts as the entry point for exploring related sub-concepts. "
                "Students should start here to build a mental model of the subject."
            ),
            "misconceptions": [
                "Thinking the root concept is just an introduction rather than a unifying theme.",
                "Assuming all child concepts are equally important.",
            ],
        },
        "concept-1": {
            "explanation": (
                "Fundamental principles are the axioms and definitions on which all "
                "other knowledge in the subject rests. Without a firm grasp of these, "
                "advanced topics become difficult to internalise."
            ),
            "misconceptions": [
                "Memorising definitions without understanding their implications.",
                "Skipping fundamentals because they seem too simple.",
            ],
        },
        "concept-2": {
            "explanation": (
                "Key mechanisms describe the 'how' of the subject — the processes, "
                "algorithms, or workflows that produce observable outcomes. "
                "Understanding these deeply enables problem-solving in novel situations."
            ),
            "misconceptions": [
                "Confusing the mechanism with its output.",
                "Assuming mechanisms are always linear and deterministic.",
            ],
        },
        "concept-3": {
            "explanation": (
                "Practical applications bridge theory and real-world usage. "
                "Examining applications reinforces theoretical understanding and "
                "reveals the value of mastering the underlying concepts."
            ),
            "misconceptions": [
                "Believing practical skills can be developed without theoretical grounding.",
                "Thinking applications are always straightforward in real scenarios.",
            ],
        },
    }


async def generate_questions(mindmap: dict) -> dict[str, list]:
    """
    Generate tiered practice questions for each concept node in a mind-map.

    Input Format
    ------------
    ``mindmap`` : The full concept map dict.

    Expected Output Format
    ----------------------
    A flat dict keyed by node ``id``, each value being a list of 3 questions::

        {
          "node-id": [
            "Recall question?",
            "Comprehension / application question?",
            "Higher-order analysis question?"
          ]
        }

    Prompting Strategy
    ------------------
    - Bloom's Taxonomy levels guide question difficulty (remember → evaluate).
    - Three questions per node balances coverage with conciseness.
    - Questions are phrased as open-ended to encourage deep thinking.

    TODO
    ----
    - Replace mock with real LLM call.
    - Validate that exactly 3 questions are returned per node.

    Parameters
    ----------
    mindmap : dict
        The concept map dict.

    Returns
    -------
    dict[str, list]
        Lists of questions keyed by node id.
    """
    # TODO: replace with real LLM call
    # prompt = _QUESTIONS_PROMPT.format(mindmap_json=json.dumps(mindmap, indent=2))
    # raw = await _call_llm(prompt)
    # return json.loads(raw)

    logger.info("generate_questions called (mock).")

    # --- MOCK RESPONSE ---
    return {
        "root": [
            "In your own words, what is the central theme of this topic?",
            "How do the sub-concepts relate to and support the root concept?",
            "Critically evaluate why this topic is significant in its broader field.",
        ],
        "concept-1": [
            "Define the fundamental principle in one sentence.",
            "Give a concrete example that illustrates this principle in practice.",
            "How would a violation of this principle affect a real-world system?",
        ],
        "concept-2": [
            "List the steps of the core mechanism in order.",
            "Apply the mechanism to solve a simple hypothetical problem.",
            "Compare this mechanism to an alternative approach — what are the trade-offs?",
        ],
        "concept-3": [
            "Name one industry that uses this concept extensively.",
            "Describe how the theoretical concept maps to a practical workflow.",
            "Analyse the limitations of current practical applications in this domain.",
        ],
    }


async def chat_with_topic(context: dict, user_message: str) -> str:
    """
    Respond to a student's question in the context of a specific topic/mindmap.

    Input Format
    ------------
    ``context`` : A dict containing relevant topic data, e.g.::

        {
          "topic_title": "Process Scheduling",
          "mindmap": { ... },         # optional
          "explanations": { ... }     # optional
        }

    ``user_message`` : The student's raw question string.

    Expected Output Format
    ----------------------
    A plain-text string (3-6 sentences) — the tutor's conversational response.

    Prompting Strategy
    ------------------
    - Context block injects topic title + mindmap/explanations for grounding.
    - The model is instructed to stay within scope but gracefully redirect
      out-of-scope questions.
    - Conversational tone is enforced (no bullet-heavy responses).
    - Low temperature (0.3) for factual accuracy, slightly higher (0.5) for
      engagement — TODO: tune per deployment.

    TODO
    ----
    - Replace mock with real LLM call.
    - Add conversation-history parameter for multi-turn dialogue.
    - Implement RAG: retrieve relevant note chunks before responding.

    Parameters
    ----------
    context : dict
        Topic context data to ground the model's response.
    user_message : str
        The student's question.

    Returns
    -------
    str
        The AI tutor's response text.
    """
    # TODO: replace with real LLM call
    # prompt = _CHAT_PROMPT.format(
    #     context_json=json.dumps(context, indent=2),
    #     user_message=user_message,
    # )
    # return await _call_llm(prompt)

    logger.info("chat_with_topic called (mock). Message='%s'", user_message[:80])

    # --- MOCK RESPONSE ---
    topic_hint = context.get("topic_title", "the topic you are studying")
    return (
        f"That's a great question about {topic_hint}! "
        "Based on the concept map we've built from your notes, this relates directly to "
        "the fundamental principles we identified. "
        "The key insight is that the core mechanism drives the observable outcome — "
        "try to trace the cause-and-effect chain step by step. "
        "If you'd like, I can break down any specific node from the mind-map in more detail. "
        "Keep going — you're making excellent progress!"
    )
