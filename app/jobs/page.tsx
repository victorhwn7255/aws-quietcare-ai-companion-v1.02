"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { askJobs } from "@/app/lib/rag";
import type { RagResponse } from "@/app/lib/rag";

const EXAMPLES = [
  "How much do ML engineers earn in Singapore?",
  "Which companies hire AI/ML engineers?",
  "What skills and tools do AI/ML jobs require?",
  "How do banks hire AI graduates?",
];

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");
  const [result, setResult] = useState<RagResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed || loading) return;
      setLoading(true);
      setError(null);
      setResult(null);
      setAsked(trimmed);
      try {
        setResult(await askJobs(trimmed));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const disabled = !query.trim() || loading;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-cream">
      {/* Header */}
      <header className="flex items-center gap-2 bg-yellow border-b-2 border-black px-6 h-[62px] shrink-0">
        <h1 className="text-xl font-bold m-0">AI/ML Jobs · Singapore</h1>
        <span className="hidden sm:inline border-2 border-black bg-white px-2 py-0.5 font-mono text-[10px]">
          retrieval-augmented · grounded in 5 docs
        </span>
        <Link
          href="/"
          className="ml-auto border-2 border-black bg-white font-bold text-xs px-3 py-1 shadow-brutal hover:bg-cream-alt active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          ← QuietPal
        </Link>
      </header>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-[760px] mx-auto px-6 py-7">
          {/* Ask form */}
          <form
            onSubmit={(e) => { e.preventDefault(); ask(query); }}
            className="bg-white border-2 border-black shadow-brutal"
          >
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(query); }
              }}
              placeholder="Ask about AI/ML jobs in Singapore…"
              rows={2}
              aria-label="Your question"
              className="w-full border-none outline-none resize-none bg-transparent font-sans text-[15px] leading-[1.6] placeholder:text-[#A0A0A0] block"
              style={{ padding: "14px 16px" }}
            />
            <div
              className="flex items-center gap-2.5"
              style={{ borderTop: "2px solid #D4D4D4", padding: "8px 12px" }}
            >
              <span className="font-mono text-[11px] text-text-2">
                grounded answers only — nothing invented
              </span>
              <button
                type="submit"
                disabled={disabled}
                className={`ml-auto border-2 border-black font-bold text-sm transition-[transform,box-shadow,background] duration-[50ms] ${
                  disabled
                    ? "bg-border-light text-text-3 cursor-not-allowed shadow-none"
                    : "bg-pink text-black shadow-brutal hover:bg-[#FF5A91] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                }`}
                style={{ padding: "6px 16px" }}
              >
                {loading ? "Searching…" : "Ask →"}
              </button>
            </div>
          </form>

          {/* Empty state — example questions */}
          {!result && !loading && !error && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-2 mb-2">
                try one
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); ask(ex); }}
                    className="border-2 border-black bg-white font-bold text-[13px] hover:bg-cream-alt cursor-pointer"
                    style={{ padding: "4px 10px" }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div
              className="mt-6 border-2 border-black bg-cream-alt text-text-2 italic"
              style={{ padding: "16px 18px" }}
              aria-live="polite"
            >
              Embedding your question, searching 85 chunks, and grounding the answer…
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 border-2 border-error bg-white" style={{ padding: "16px 18px" }}>
              <div className="font-bold text-error mb-1">Could not get an answer</div>
              <div className="font-mono text-[12px] text-text-2 break-words">{error}</div>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="mt-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-2 mb-2">
                answer
              </div>
              <div className="bg-white border-2 border-black shadow-brutal" style={{ padding: "18px 20px" }}>
                <p className="text-[11px] font-mono text-text-2 m-0 mb-3">Q: {asked}</p>
                <p className="text-[15px] leading-[1.65] m-0 whitespace-pre-wrap">{result.answer}</p>
              </div>

              {/* Retrieved sources — the "show your work" of RAG */}
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-2 mt-6 mb-2">
                retrieved sources ({result.sources.length})
              </div>
              {result.sources.length === 0 ? (
                <div
                  className="border-2 border-black bg-cream-alt text-text-2 italic"
                  style={{ padding: "14px 16px" }}
                >
                  No passages cleared the relevance threshold — the answer above is the model declining to guess.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {result.sources.map((s, i) => (
                    <div key={i} className="bg-white border-2 border-black">
                      <div
                        className="flex items-center gap-2 border-b-2 border-black bg-lavender"
                        style={{ padding: "6px 10px" }}
                      >
                        <span
                          className="border-2 border-black bg-white font-bold font-mono text-[11px]"
                          style={{ padding: "1px 7px" }}
                        >
                          [{i + 1}]
                        </span>
                        <span className="font-mono text-[11px] font-bold">
                          score {s.score.toFixed(3)}
                        </span>
                        <span
                          className="ml-auto font-mono text-[10px] text-text-2 truncate max-w-[55%]"
                          title={s.source}
                        >
                          {s.source}
                        </span>
                      </div>
                      {s.heading && (
                        <div
                          className="font-bold text-[13px] border-b-2 border-border-light"
                          style={{ padding: "6px 10px" }}
                        >
                          {s.heading}
                        </div>
                      )}
                      <div
                        className="text-[13px] leading-[1.5] text-text-2 overflow-y-auto whitespace-pre-wrap"
                        style={{ padding: "10px", maxHeight: "128px" }}
                      >
                        {s.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
