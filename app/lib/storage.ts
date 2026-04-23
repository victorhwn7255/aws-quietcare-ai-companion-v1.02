import { Letter } from "./types";

const STORAGE_KEY = "quietpal:sent-letters:v1";

function isValidLetter(obj: unknown): obj is Letter {
  if (typeof obj !== "object" || obj === null) return false;
  const l = obj as Record<string, unknown>;
  return (
    typeof l.id === "string" &&
    typeof l.date === "string" &&
    typeof l.state === "string" &&
    ["waiting", "unread", "read", "failed"].includes(l.state as string)
  );
}

export function loadSentLetters(): Letter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Validate each letter individually — drop malformed ones
    return parsed.filter(isValidLetter);
  } catch {
    return [];
  }
}

export function saveSentLetters(letters: Letter[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letters));
  } catch (err) {
    console.warn("Failed to save to localStorage:", err);
  }
}
