"use client";

interface LetterComposerProps {
  body: string;
  onChange: (text: string) => void;
  wordCount: number;
  canSend: boolean;
  isSending: boolean;
  onSend: () => void;
}

export function LetterComposer({ body, onChange, wordCount, canSend, isSending, onSend }: LetterComposerProps) {
  const disabled = !canSend || isSending;

  return (
    <div className="bg-white border-2 border-black shadow-brutal">
      <textarea
        value={body}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Dear Iris,"
        className="w-full border-none outline-none resize-none bg-transparent font-sans text-[15px] leading-[1.6] placeholder:text-[#A0A0A0] block"
        style={{ padding: "16px 18px", minHeight: "200px", maxHeight: "360px" }}
      />
      <div
        className="flex items-center gap-2.5"
        style={{ borderTop: "2px solid #D4D4D4", padding: "8px 12px" }}
      >
        <span className="font-mono text-[11px] text-text-2">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <button
          onClick={onSend}
          disabled={disabled}
          className={`ml-auto border-2 border-black font-bold text-sm transition-[transform,box-shadow,background] duration-[50ms] ${
            disabled
              ? "bg-border-light text-text-3 cursor-not-allowed shadow-none"
              : "bg-pink text-black shadow-brutal hover:bg-[#FF5A91] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          }`}
          style={{ padding: "6px 16px" }}
        >
          {isSending ? "Sending..." : "Send to Iris →"}
        </button>
      </div>
    </div>
  );
}
