export interface DraftState {
  mood: number;
  keywords: Set<string>;
  body: string;
}

export type LetterState = "waiting" | "unread" | "read" | "failed";

export interface Letter {
  id: string;
  date: string;
  state: LetterState;
  userLetter?: string;    // present for real sent letters, absent for seeded
  reply?: string;         // Iris's raw reply — absent while waiting
  subject?: string;       // Iris writes the subject; absent while waiting
  body?: string[];        // Iris's reply paragraphs; absent while waiting
  mood?: number;          // optional metadata
  keywords?: string[];    // optional metadata
}
