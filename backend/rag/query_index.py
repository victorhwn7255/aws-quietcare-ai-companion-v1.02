#!/usr/bin/env python3
"""
query_index.py — try RETRIEVAL (and optionally the full grounded answer) locally,
without deploying to AWS. This is your window into what RAG actually does: it
prints every candidate chunk with its cosine score and whether it cleared the
threshold, so you can *see* retrieval working before wiring up the frontend.

Requires the index to exist first:
    OPENAI_API_KEY=sk-... python build_index.py

Then:
    OPENAI_API_KEY=sk-... python query_index.py "will AI take my software job?"
    OPENAI_API_KEY=sk-... python query_index.py --no-answer "MLE salary in Singapore"
"""

import argparse
import sys
import textwrap
from pathlib import Path

# rag.py + rag_prompt.py live in backend/ (one directory up from backend/rag/)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import rag  # noqa: E402


def main() -> None:
    ap = argparse.ArgumentParser(description="Query the RAG knowledge base locally.")
    ap.add_argument("query", help="the question to ask")
    ap.add_argument("--no-answer", action="store_true",
                    help="show retrieval only; skip the GPT-4o generation call")
    ap.add_argument("-k", "--top-k", type=int, default=rag.TOP_K)
    args = ap.parse_args()

    if not rag._find_kb().exists():
        sys.exit("knowledge_base.json not found — run build_index.py first.")

    print(f"\nQ: {args.query}")

    # Retrieve with NO floor so you can see the full ranking, including chunks
    # that fall below the MIN_SCORE gate (marked accordingly).
    print("\n── RETRIEVAL (cosine similarity, ranked) " + "─" * 32)
    hits = rag.retrieve(args.query, top_k=args.top_k, min_score=0.0)
    for i, r in enumerate(hits, 1):
        c = r["chunk"]
        gate = "✓ used" if r["score"] >= rag.MIN_SCORE else f"· below {rag.MIN_SCORE} floor (dropped)"
        print(f"\n[{i}] score={r['score']:.3f}  {gate}")
        print(f"    source : {c['source']}")
        print(f"    heading: {c['heading'] or '(none)'}")
        print(textwrap.fill(c["text"][:220] + "...", 76,
                            initial_indent="    ", subsequent_indent="    "))

    if args.no_answer:
        return

    print("\n── GROUNDED ANSWER (GPT-4o) " + "─" * 45)
    result = rag.answer_question(args.query, top_k=args.top_k)
    print("\n" + textwrap.fill(result["answer"], 76))
    cites = ", ".join(f"[{i + 1}] {s['source']} ({s['score']})"
                      for i, s in enumerate(result["sources"]))
    print("\nsources:", cites or "(none — nothing cleared the threshold)")


if __name__ == "__main__":
    main()
