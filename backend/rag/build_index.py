#!/usr/bin/env python3
"""
build_index.py — the OFFLINE half of RAG ("indexing").

Run this ONCE, locally, to turn the source documents in docs/ai-ml-jobs/ into a
searchable knowledge base written to backend/rag/knowledge_base.json.

The four indexing stages of RAG:

    1. LOAD   — read each document's raw text (PDF -> text, .md -> text)
    2. CHUNK  — split each document into ~600-token passages (with overlap)
    3. EMBED  — turn each chunk into a vector via the OpenAI embeddings API
    4. SAVE   — write chunks + vectors + metadata to knowledge_base.json

The Lambda NEVER runs this file. It only reads the JSON this file produces.
That separation is the whole point: expensive/one-off work happens offline;
the request path stays cheap.

Usage:
    # Inspect chunks WITHOUT spending money on embeddings (no API key needed):
    python build_index.py --dry-run

    # Build the real index (needs your OpenAI key):
    OPENAI_API_KEY=sk-... python build_index.py
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import textwrap
from pathlib import Path

# ─── Config ──────────────────────────────────────────────────────────────
HERE = Path(__file__).resolve().parent
SOURCE_DIR = HERE.parent.parent / "docs" / "ai-ml-jobs"   # where the corpus lives
OUTPUT = HERE / "knowledge_base.json"

EMBEDDING_MODEL = "text-embedding-3-small"  # 1536-dim, cheap, great for English prose
TARGET_TOKENS = 600      # aim for ~600-token chunks (one complete idea)
OVERLAP_TOKENS = 90      # ~15% overlap so a fact on a boundary survives in a chunk
EMBED_BATCH = 64         # embed many chunks per API call (far faster + cheaper)


# ─── Token estimate ──────────────────────────────────────────────────────
# We deliberately avoid a tokenizer dependency. For English, "~4 chars ≈ 1 token"
# is a perfectly good proxy for *chunking decisions*. (Swap in tiktoken if you
# ever need exact counts — but you don't, for splitting.)
def est_tokens(text: str) -> int:
    return max(1, len(text) // 4)


# ─── Stage 1: LOAD ───────────────────────────────────────────────────────
def load_documents(source_dir: Path) -> list[dict]:
    """Read every PDF/markdown file in the source dir into raw text."""
    docs = []
    for path in sorted(source_dir.iterdir()):
        if path.suffix.lower() == ".pdf":
            text = _pdf_to_text(path)
        elif path.suffix.lower() in (".md", ".txt"):
            text = path.read_text(encoding="utf-8")
        else:
            continue  # skip images and anything else
        docs.append({"source": path.name, "text": clean_text(text)})
        print(f"  loaded {path.name}: {len(text):,} chars")
    return docs


def _pdf_to_text(path: Path) -> str:
    import fitz  # PyMuPDF — best-in-class plain-text extraction for prose PDFs
    parts = []
    with fitz.open(path) as pdf:
        for page in pdf:
            parts.append(page.get_text("text"))
    return "\n".join(parts)


def clean_text(text: str) -> str:
    """
    Light, conservative cleanup. Real corpora are messy (headers, footers, page
    numbers). We only remove standalone page-number lines and collapse blank
    runs. We do NOT strip stray citation markers, because being aggressive risks
    deleting real data like "95%" or "988" — losing a fact is worse than keeping
    a stray "12".
    """
    lines = []
    for line in text.splitlines():
        s = line.rstrip()
        if re.fullmatch(r"\s*\d{1,3}\s*", s):  # a line that is only a page number
            continue
        lines.append(s)
    text = "\n".join(lines)
    text = re.sub(r"\n{3,}", "\n\n", text)      # collapse 3+ blank lines to one
    return text.strip()


# ─── Stage 2: CHUNK ──────────────────────────────────────────────────────
# Why chunk at all? Two reasons:
#   (1) Precision — a small passage embeds to a sharper vector than a whole doc,
#       so retrieval points at the exact relevant bit.
#   (2) Budget — you inject a few chunks into the prompt, not the whole corpus.
# Why STRUCTURE-AWARE (paragraphs + headings) instead of blind fixed-size?
#   Because these docs are cleanly structured. Splitting on natural boundaries
#   keeps a fact whole instead of guillotining it mid-sentence.

HEADING_RE = re.compile(r"^#{1,6}\s+\S")  # markdown heading


def looks_like_heading(line: str) -> bool:
    s = line.strip()
    if not s:
        return False
    if HEADING_RE.match(s):
        return True
    # Heuristic for PDF text (no markdown): short, title-ish, no end punctuation.
    if len(s) <= 70 and s[0].isalpha() and not s.endswith((".", ",", ";", ":")):
        words = s.split()
        if 1 <= len(words) <= 10:
            capish = sum(1 for w in words if w[:1].isupper() or not w[:1].isalpha())
            if capish >= len(words) - 1:
                return True
    return False


def paragraphs_with_headings(text: str):
    """
    Yield (heading, paragraph) pairs. We reflow hard-wrapped PDF lines into whole
    paragraphs (blank line = paragraph break) and remember the most recent heading
    so each chunk can carry it as metadata.
    """
    current_heading = ""
    buf: list[str] = []

    def emit():
        nonlocal buf
        if buf:
            para = " ".join(buf).strip()
            buf = []
            return para
        return None

    for line in text.splitlines():
        if looks_like_heading(line):
            para = emit()
            if para:
                yield current_heading, para
            current_heading = re.sub(r"^#{1,6}\s+", "", line.strip())
            continue
        if line.strip():
            buf.append(line.strip())
        else:
            para = emit()
            if para:
                yield current_heading, para
    para = emit()
    if para:
        yield current_heading, para


def _words_for(tokens: int) -> int:
    """Approx word count for a token budget (our est is ~1.5 est-tokens/word)."""
    return max(1, tokens * 2 // 3)


def _hard_split(s: str) -> list[str]:
    """Last-resort split for a single 'sentence' bigger than the target
    (e.g. an unpunctuated bullet list): cut it on a fixed word window."""
    words = s.split()
    per = _words_for(TARGET_TOKENS)
    return [" ".join(words[i:i + per]) for i in range(0, len(words), per)] or [s]


def _fit_pieces(para: str) -> list[str]:
    """Split a paragraph that is itself longer than the target, by sentence —
    and hard-split any sentence that is STILL too long, so no piece can ever
    exceed the budget."""
    if est_tokens(para) <= TARGET_TOKENS:
        return [para]
    sentences = re.split(r"(?<=[.!?])\s+", para)
    pieces, cur, ct = [], [], 0
    for s in sentences:
        for seg in ([s] if est_tokens(s) <= TARGET_TOKENS else _hard_split(s)):
            st = est_tokens(seg)
            if ct + st > TARGET_TOKENS and cur:
                pieces.append(" ".join(cur))
                cur, ct = [], 0
            cur.append(seg)
            ct += st
    if cur:
        pieces.append(" ".join(cur))
    return pieces


def _overlap_tail(body: str) -> str:
    """The trailing ~OVERLAP_TOKENS WORDS of a chunk — a bounded overlap that
    can't balloon even when paragraphs are large (the bug in the naive version)."""
    words = body.split()
    return " ".join(words[-_words_for(OVERLAP_TOKENS):]) if words else ""


def chunk_document(source: str, text: str) -> list[dict]:
    """
    Two clean passes (separation of concerns):
      1. FLATTEN — turn the doc into a list of (heading, piece) where every piece
         is already <= TARGET_TOKENS.
      2. PACK    — greedily fill chunks up to the budget, seeding each new chunk
         with a bounded word-level overlap of the previous one.
    """
    # Pass 1 — flatten to bounded pieces
    units: list[tuple[str, str]] = []
    for heading, para in paragraphs_with_headings(text):
        for piece in _fit_pieces(para):
            units.append((heading, piece))

    # Pass 2 — greedily pack
    chunks: list[dict] = []
    cur: list[str] = []
    cur_tokens = 0
    cur_heading = ""

    def flush():
        nonlocal cur, cur_tokens
        if not cur:
            return
        chunks.append({
            "source": source,
            "heading": cur_heading,
            "text": "\n\n".join(cur).strip(),
        })
        cur, cur_tokens = [], 0

    for heading, piece in units:
        pt = est_tokens(piece)
        if cur and cur_tokens + pt > TARGET_TOKENS:
            tail = _overlap_tail("\n\n".join(cur))
            flush()
            if tail:
                cur.append(tail)
                cur_tokens += est_tokens(tail)
        if not cur:
            cur_heading = heading  # chunk inherits the heading active at its start
        cur.append(piece)
        cur_tokens += pt
    flush()
    return chunks


# ─── Stage 3: EMBED ──────────────────────────────────────────────────────
def embed_chunks(chunks: list[dict]) -> None:
    """Add an `embedding` vector to each chunk, in batches."""
    from openai import OpenAI
    client = OpenAI()  # reads OPENAI_API_KEY from the environment
    for i in range(0, len(chunks), EMBED_BATCH):
        batch = chunks[i:i + EMBED_BATCH]
        resp = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=[c["text"] for c in batch],
        )
        for c, d in zip(batch, resp.data):
            c["embedding"] = d.embedding
        print(f"  embedded {min(i + EMBED_BATCH, len(chunks))}/{len(chunks)}")


# ─── Stage 4: SAVE ───────────────────────────────────────────────────────
def save_index(chunks: list[dict], path: Path) -> None:
    dim = len(chunks[0]["embedding"]) if chunks and "embedding" in chunks[0] else 0
    payload = {
        # Record the model + dims so the Lambda can assert the query uses the
        # SAME embedding model — mixing models silently breaks retrieval.
        "embedding_model": EMBEDDING_MODEL,
        "dim": dim,
        "chunk_count": len(chunks),
        "chunks": [{"id": i, **c} for i, c in enumerate(chunks)],
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


# ─── Orchestration ───────────────────────────────────────────────────────
def main() -> None:
    ap = argparse.ArgumentParser(description="Build the RAG knowledge base.")
    ap.add_argument("--dry-run", action="store_true",
                    help="LOAD + CHUNK only; skip embeddings (no API key needed)")
    ap.add_argument("--samples", type=int, default=3,
                    help="how many sample chunks to print in --dry-run")
    args = ap.parse_args()

    print(f"Source: {SOURCE_DIR}")
    if not SOURCE_DIR.exists():
        sys.exit(f"Source dir not found: {SOURCE_DIR}")

    print("\n[1/4] LOAD")
    docs = load_documents(SOURCE_DIR)

    print("\n[2/4] CHUNK")
    chunks: list[dict] = []
    for d in docs:
        dc = chunk_document(d["source"], d["text"])
        print(f"  {d['source']}: {len(dc)} chunks")
        chunks.extend(dc)
    toks = [est_tokens(c["text"]) for c in chunks]
    print(f"  TOTAL: {len(chunks)} chunks | ~tokens "
          f"min {min(toks)} / avg {sum(toks) // len(toks)} / max {max(toks)}")

    if args.dry_run:
        print(f"\n[dry-run] {args.samples} sample chunks:\n")
        for c in chunks[:args.samples]:
            print("─" * 72)
            print(f"source : {c['source']}")
            print(f"heading: {c['heading'] or '(none)'}")
            print(f"~tokens: {est_tokens(c['text'])}")
            print(textwrap.fill(c["text"][:600], 72))
            print()
        print("[dry-run] no embeddings created, nothing written.")
        return

    print("\n[3/4] EMBED")
    embed_chunks(chunks)

    print("\n[4/4] SAVE")
    save_index(chunks, OUTPUT)
    size_mb = OUTPUT.stat().st_size / 1_000_000
    print(f"  wrote {OUTPUT.name}  ({size_mb:.1f} MB, {len(chunks)} chunks)")


if __name__ == "__main__":
    main()
