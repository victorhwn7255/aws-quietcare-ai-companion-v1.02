"use client";

import { useState, useCallback, useMemo } from "react";

const DEFAULT_MOOD = 3;
const DEFAULT_KEYWORDS = new Set(["tired", "stuck"]);

export function useDraft() {
  const [mood, setMood] = useState(DEFAULT_MOOD);
  const [keywords, setKeywords] = useState<Set<string>>(DEFAULT_KEYWORDS);
  const [body, setBody] = useState("");

  const wordCount = useMemo(() => {
    const trimmed = body.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [body]);

  const canSend = wordCount > 0;

  const toggleKeyword = useCallback((keyword: string) => {
    setKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) {
        next.delete(keyword);
      } else {
        next.add(keyword);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setMood(DEFAULT_MOOD);
    setKeywords(new Set(DEFAULT_KEYWORDS));
    setBody("");
  }, []);

  return {
    mood,
    setMood,
    keywords,
    toggleKeyword,
    body,
    setBody,
    wordCount,
    canSend,
    reset,
  };
}
