"""
rag.py — the ONLINE half of RAG: retrieve -> augment -> generate.

The Lambda calls answer_question(query) for a jobs-KB question. Flow:

    1. EMBED     the question with the SAME model used to build the index
    2. RETRIEVE  the most similar chunks (cosine similarity, top-k + threshold)
    3. AUGMENT   build a prompt that places those chunks in front of the model
    4. GENERATE  GPT-4o answers, grounded ONLY in the retrieved chunks

Returns {"answer": str, "sources": [...]} so the caller can show citations.

No vector DB, no numpy: the corpus is small (~85 chunks), so we load the JSON
once per warm Lambda container and do plain-Python cosine. That is deliberately
transparent — you can read exactly how retrieval works.
"""

from __future__ import annotations

import json
import math
from functools import lru_cache
from pathlib import Path

from rag_prompt import RAG_SYSTEM_PROMPT

# ─── Config (kept in sync with build_index.py) ───────────────────────────
EMBEDDING_MODEL = "text-embedding-3-small"   # MUST match the model the index was built with
CHAT_MODEL = "gpt-4o"
TOP_K = 4                # how many chunks to feed the model
MIN_SCORE = 0.30         # cosine floor; below this we treat the KB as having "no match"
MAX_OUTPUT_TOKENS = 500
TEMPERATURE = 0.2        # low → factual, grounded, minimal improvisation


# ─── Load the vector store (once per warm container) ─────────────────────
def _find_kb() -> Path:
    """Locate knowledge_base.json for both the repo layout (backend/rag/…) and a
    flattened Lambda zip (everything at the root)."""
    here = Path(__file__).resolve().parent
    for cand in (here / "knowledge_base.json", here / "rag" / "knowledge_base.json"):
        if cand.exists():
            return cand
    return here / "rag" / "knowledge_base.json"  # default: repo layout


@lru_cache(maxsize=1)
def _load_kb() -> dict:
    """
    Parse knowledge_base.json ONCE and cache it. A Lambda container is reused
    across invocations, so this cost is paid on cold start only — warm requests
    reuse the parsed store. We also precompute each chunk vector's magnitude
    (its "norm") so cosine is just a dot product at query time.
    """
    kb = json.loads(_find_kb().read_text(encoding="utf-8"))
    for c in kb["chunks"]:
        c["_norm"] = math.sqrt(sum(x * x for x in c["embedding"])) or 1.0
    return kb


# ─── Cosine similarity — the heart of retrieval ──────────────────────────
# cos(θ) = (A · B) / (‖A‖ · ‖B‖). It measures the ANGLE between two vectors and
# ignores their length — "do these point the same way in meaning-space?"
#   1.0 = identical direction · 0.0 = unrelated (orthogonal) · -1.0 = opposite
def _cosine(a: list[float], a_norm: float, b: list[float], b_norm: float) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (a_norm * b_norm)


# ─── Stage 1: EMBED the query (same model as the index) ──────────────────
def _embed(text: str) -> list[float]:
    from openai import OpenAI          # lazy import: keeps this module importable without the SDK
    client = OpenAI()                  # reads OPENAI_API_KEY from the environment
    resp = client.embeddings.create(model=EMBEDDING_MODEL, input=[text])
    return resp.data[0].embedding


# ─── Stage 2: RETRIEVE top-k chunks above the threshold ──────────────────
def retrieve(query: str, top_k: int = TOP_K, min_score: float = MIN_SCORE) -> list[dict]:
    kb = _load_kb()
    if kb.get("embedding_model") != EMBEDDING_MODEL:
        # The #1 silent RAG bug: querying with a different model than you indexed with.
        raise RuntimeError(
            f"Index built with {kb.get('embedding_model')!r} but querying with "
            f"{EMBEDDING_MODEL!r} — rebuild the index or fix the model."
        )
    q = _embed(query)
    q_norm = math.sqrt(sum(x * x for x in q)) or 1.0

    scored = [
        {"score": _cosine(q, q_norm, c["embedding"], c["_norm"]), "chunk": c}
        for c in kb["chunks"]
    ]
    scored.sort(key=lambda r: r["score"], reverse=True)
    # Take the top-k FIRST, then drop anything below the floor. Off-topic queries
    # whose best match is still weak end up returning nothing → the model refuses.
    return [r for r in scored[:top_k] if r["score"] >= min_score]


# ─── Stage 3: AUGMENT — assemble the numbered context block ──────────────
def _format_context(hits: list[dict]) -> str:
    blocks = []
    for i, r in enumerate(hits, 1):
        c = r["chunk"]
        label = f"[{i}] {c['source']}"
        if c.get("heading"):
            label += f" — {c['heading']}"
        blocks.append(f"{label}\n{c['text']}")
    return "Context passages:\n\n" + "\n\n---\n\n".join(blocks)


# ─── Stage 4: GENERATE a grounded answer ─────────────────────────────────
def answer_question(query: str, top_k: int = TOP_K, min_score: float = MIN_SCORE) -> dict:
    hits = retrieve(query, top_k, min_score)

    # Threshold gate: if nothing cleared the bar, DON'T ask the model to guess.
    if not hits:
        return {
            "answer": "I couldn't find anything about that in the knowledge base.",
            "sources": [],
        }

    context = _format_context(hits)
    from openai import OpenAI
    client = OpenAI()
    resp = client.chat.completions.create(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": RAG_SYSTEM_PROMPT},
            # The retrieved context and the question travel together in the user turn.
            {"role": "user", "content": f"{context}\n\nQuestion: {query}"},
        ],
        max_tokens=MAX_OUTPUT_TOKENS,
        temperature=TEMPERATURE,
    )
    answer = resp.choices[0].message.content or ""

    sources = [
        {
            "source": r["chunk"]["source"],
            "heading": r["chunk"].get("heading", ""),
            "score": round(r["score"], 3),
            "text": r["chunk"]["text"],
        }
        for r in hits
    ]
    return {"answer": answer, "sources": sources}
