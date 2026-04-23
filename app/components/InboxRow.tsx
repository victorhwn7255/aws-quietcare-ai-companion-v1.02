"use client";

import { Letter } from "@/app/lib/types";
import { formatShortDate, formatLongDate } from "@/app/lib/constants";

interface InboxRowProps {
  letter: Letter;
  onClick: () => void;
}

export function InboxRow({ letter, onClick }: InboxRowProps) {
  const { state } = letter;
  const isWaiting = state === "waiting";
  const isFailed = state === "failed";
  const isUnread = state === "unread";

  // Snippet: for waiting/failed, show user's letter; for unread/read, show Iris's reply
  let snippet: string;
  if (isWaiting || isFailed) {
    snippet = letter.userLetter ?? "";
  } else {
    snippet = letter.body && letter.body.length > 1 ? letter.body[1] : (letter.body?.[0] ?? "");
  }

  // Sender label
  const senderLabel = isWaiting ? "Iris is reading" : "Iris";

  // Row bg
  let bgClasses: string;
  if (isWaiting) {
    bgClasses = "bg-cream-alt hover:bg-[#FCEAA0]";
  } else if (isFailed) {
    bgClasses = "bg-cream-alt";
  } else if (isUnread) {
    bgClasses = "bg-yellow hover:bg-[#F7CC00]";
  } else {
    bgClasses = "bg-white hover:bg-cream-alt";
  }

  // ARIA label for screen readers
  const stateLabel = isWaiting ? "Waiting" : isUnread ? "Unread" : isFailed ? "Failed" : "Read";
  const subjectText = letter.subject ?? "letter";
  const ariaLabel = isWaiting
    ? `Waiting for reply from Iris, ${formatLongDate(letter.date)}`
    : isFailed
      ? `Failed letter, ${formatLongDate(letter.date)}`
      : `${stateLabel} letter from Iris, ${formatLongDate(letter.date)}, ${subjectText}`;

  return (
    <button
      type="button"
      onClick={isFailed ? undefined : onClick}
      disabled={isFailed}
      aria-label={ariaLabel}
      className={`w-full text-left border-b-2 border-black transition-colors duration-[50ms] ${bgClasses} ${
        isFailed ? "cursor-default" : "cursor-pointer"
      }`}
      style={{ padding: "14px 18px" }}
    >
      {/* Row 1: dot + name + date */}
      <div className="flex items-center gap-2 mb-1">
        {isUnread && (
          <span
            className="inline-block bg-pink shrink-0"
            aria-hidden="true"
            style={{ width: "8px", height: "8px", border: "1.5px solid #000" }}
          />
        )}
        <span className={`font-bold text-sm ${isWaiting ? "text-text-2 italic" : ""}`}>
          {senderLabel}
        </span>
        <span className={`ml-auto font-mono text-[11px] ${isUnread ? "text-black" : "text-text-2"}`}>
          {formatShortDate(letter.date)}
        </span>
      </div>

      {/* Snippet or error message */}
      {isFailed ? (
        <p className="text-[13px] leading-[1.4] m-0 text-text-2 italic">
          Iris couldn&apos;t respond — try again later
        </p>
      ) : (
        <p
          className={`text-[13px] leading-[1.4] m-0 line-clamp-2 ${
            isUnread ? "text-black" : "text-text-2"
          }`}
        >
          {snippet}
        </p>
      )}
    </button>
  );
}
