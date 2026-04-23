"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Letter } from "@/app/lib/types";
import { seededLetters } from "@/app/lib/seeded-letters";
import { sendToLambda, buildLetterContent } from "@/app/lib/lambda";
import { loadSentLetters, saveSentLetters } from "@/app/lib/storage";

const DELAY_MS = 30_000;

interface SendPayload {
  body: string;
  mood: number;
  keywords: string[];
}

function parseReply(reply: string) {
  const bodyParagraphs = reply
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .filter((p) => !/^—\s*Iris$/i.test(p));
  const subject = "a letter back";
  return { subject, bodyParagraphs };
}

/**
 * Resume waiting letters from persisted storage.
 * Returns the processed letters array and any timers that need scheduling.
 */
function resumeLetters(stored: Letter[]): {
  letters: Letter[];
  timers: { id: string; delay: number }[];
} {
  const now = Date.now();
  const timers: { id: string; delay: number }[] = [];

  const letters = stored.map((letter) => {
    if (letter.state !== "waiting") {
      // Case D: non-waiting — render as-is
      return letter;
    }

    if (!letter.reply) {
      // Case C: waiting but no reply — fetch never completed
      return { ...letter, state: "failed" as const };
    }

    const sentAt = new Date(letter.date).getTime();
    // Clock skew guard: if sentAt is in the future, treat as "just now"
    const effectiveSentAt = sentAt > now ? now : sentAt;
    const elapsed = now - effectiveSentAt;

    if (elapsed >= DELAY_MS) {
      // Case A: timer already expired — transition to unread immediately
      const { subject, bodyParagraphs } = parseReply(letter.reply);
      return {
        ...letter,
        state: "unread" as const,
        subject: letter.subject ?? subject,
        body: letter.body ?? bodyParagraphs,
      };
    } else {
      // Case B: timer still running — schedule remaining time
      timers.push({ id: letter.id, delay: DELAY_MS - elapsed });
      return letter;
    }
  });

  return { letters, timers };
}

export function useInbox() {
  const pendingTimersRef = useRef<Array<{ id: string; delay: number }>>([]);
  const timerIdsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const [letters, setLetters] = useState<Letter[]>(() => {
    // Lazy initializer: load persisted sent letters, resume timers, prepend to seeded
    if (typeof window === "undefined") return seededLetters;

    const stored = loadSentLetters();
    if (stored.length === 0) return seededLetters;

    const { letters: resumed, timers } = resumeLetters(stored);
    pendingTimersRef.current = timers;
    return [...resumed, ...seededLetters];
  });

  const [openLetterId, setOpenLetterId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Schedule resumed timers on mount
  useEffect(() => {
    const timers = pendingTimersRef.current;
    pendingTimersRef.current = [];

    for (const { id, delay } of timers) {
      const timerId = setTimeout(() => {
        setLetters((prev) =>
          prev.map((l) => {
            if (l.id !== id || l.state !== "waiting" || !l.reply) return l;
            const { subject, bodyParagraphs } = parseReply(l.reply);
            return {
              ...l,
              state: "unread" as const,
              subject: l.subject ?? subject,
              body: l.body ?? bodyParagraphs,
            };
          })
        );
      }, delay);
      timerIdsRef.current.push(timerId);
    }

    return () => {
      timerIdsRef.current.forEach(clearTimeout);
      timerIdsRef.current = [];
    };
  }, []);

  // Persist real sent letters on every mutation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const realLetters = letters.filter((l) => l.userLetter !== undefined);
    saveSentLetters(realLetters);
  }, [letters]);

  const unreadCount = useMemo(
    () => letters.filter((l) => l.state === "unread").length,
    [letters]
  );

  const openLetter = useCallback((id: string) => {
    // Mark unread → read on open; waiting rows can be opened but not marked read
    setLetters((prev) => {
      const letter = prev.find((l) => l.id === id);
      if (!letter || letter.state === "failed") return prev;
      if (letter.state === "waiting") return prev; // don't mutate waiting letters
      return prev.map((l) =>
        l.id === id && l.state === "unread" ? { ...l, state: "read" as const } : l
      );
    });
    setOpenLetterId(id);
  }, []);

  const closeLetter = useCallback(() => {
    setOpenLetterId(null);
  }, []);

  const sendLetter = useCallback(async (payload: SendPayload) => {
    const id = crypto.randomUUID();
    const dateISO = new Date().toISOString();

    // Add waiting entry at top
    const waitingLetter: Letter = {
      id,
      date: dateISO,
      state: "waiting",
      userLetter: payload.body,
      mood: payload.mood,
      keywords: payload.keywords,
    };

    setLetters((prev) => [waitingLetter, ...prev]);
    setIsSending(true);

    try {
      const content = buildLetterContent(payload.body, payload.mood, payload.keywords);
      const { reply } = await sendToLambda(content);
      setIsSending(false);

      const { subject, bodyParagraphs } = parseReply(reply);

      // Store reply immediately while keeping state as "waiting"
      // This ensures the reply is persisted even if the tab closes before the timer fires
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, reply, subject, body: bodyParagraphs } : l
        )
      );

      // Schedule transition from waiting → unread after delay
      const timerId = setTimeout(() => {
        setLetters((prev) =>
          prev.map((l) =>
            l.id === id && l.state === "waiting"
              ? { ...l, state: "unread" as const }
              : l
          )
        );
      }, DELAY_MS);
      timerIdsRef.current.push(timerId);
    } catch (err) {
      console.error("Lambda call failed:", err);
      setIsSending(false);
      setLetters((prev) =>
        prev.map((l) =>
          l.id === id ? { ...l, state: "failed" as const } : l
        )
      );
    }
  }, []);

  const currentLetter = useMemo(
    () => (openLetterId ? letters.find((l) => l.id === openLetterId) ?? null : null),
    [letters, openLetterId]
  );

  return {
    letters,
    openLetterId,
    currentLetter,
    unreadCount,
    isSending,
    openLetter,
    closeLetter,
    sendLetter,
  };
}
