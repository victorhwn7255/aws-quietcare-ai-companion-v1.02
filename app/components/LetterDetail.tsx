"use client";

import { Letter } from "@/app/lib/types";
import { formatLongDate } from "@/app/lib/constants";

interface LetterDetailProps {
  letter: Letter;
}

export function LetterDetail({ letter }: LetterDetailProps) {
  const isWaiting = letter.state === "waiting";

  return (
    <article className="flex-1 overflow-y-auto bg-cream min-h-0" style={{ padding: "22px 22px 28px" }}>
      {/* Date eyebrow */}
      <div
        className="font-mono text-[11px] text-text-2 uppercase"
        style={{ letterSpacing: "0.06em", marginBottom: "8px" }}
      >
        {formatLongDate(letter.date)}
      </div>

      {isWaiting ? (
        <>
          {/* Waiting state: show user's letter */}
          <h2 className="text-[20px] font-bold leading-[1.3] m-0" style={{ marginBottom: "14px" }}>
            Your letter
          </h2>
          <p className="text-[15px] leading-[1.65] m-0" style={{ marginBottom: "24px" }}>
            {letter.userLetter}
          </p>

          {/* Placeholder for Iris's reply */}
          <div
            className="border-2 border-border-light bg-cream-alt text-text-2 text-[14px] italic"
            style={{ padding: "16px 18px" }}
          >
            Iris is reading your letter...
          </div>
        </>
      ) : (
        <>
          {/* Subject */}
          <h2 className="text-[20px] font-bold leading-[1.3] m-0" style={{ marginBottom: "14px" }}>
            {letter.subject}
          </h2>

          {/* Body paragraphs */}
          {letter.body?.map((p, i) => (
            <p key={i} className="text-[15px] leading-[1.65] m-0" style={{ marginBottom: "12px" }}>
              {p}
            </p>
          ))}

          {/* Signoff + stamp in footer */}
          <footer>
            <p className="font-bold italic m-0" style={{ marginTop: "18px" }}>
              — Iris
            </p>

            <span
              className="inline-block border-2 border-black bg-white font-mono text-[10px] text-text-2 uppercase"
              style={{ letterSpacing: "0.08em", padding: "2px 10px", marginTop: "18px" }}
            >
              read · delivered 2–6 hrs after you sent
            </span>
          </footer>
        </>
      )}
    </article>
  );
}
