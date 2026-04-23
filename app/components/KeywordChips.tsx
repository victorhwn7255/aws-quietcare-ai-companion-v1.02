"use client";

const ALL_KEYWORDS = [
  "anxious", "grateful", "tired", "hopeful", "restless",
  "tender", "proud", "stuck", "curious", "lonely", "steady",
  "overwhelmed", "adrift", "behind", "conflicted",
];

interface KeywordChipsProps {
  selected: Set<string>;
  onToggle: (keyword: string) => void;
}

export function KeywordChips({ selected, onToggle }: KeywordChipsProps) {
  return (
    <div className="bg-white border-2 border-black flex flex-wrap gap-1.5" style={{ padding: "14px 16px" }}>
      {ALL_KEYWORDS.map((kw) => (
        <button
          key={kw}
          onClick={() => onToggle(kw)}
          aria-pressed={selected.has(kw)}
          className={`border-2 border-black font-bold text-[13px] cursor-pointer transition-colors duration-[50ms] ${
            selected.has(kw) ? "bg-lavender" : "bg-white hover:bg-cream-alt"
          }`}
          style={{ padding: "3px 10px" }}
        >
          {kw}
        </button>
      ))}
    </div>
  );
}
