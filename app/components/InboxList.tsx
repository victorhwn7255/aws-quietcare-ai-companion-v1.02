"use client";

import { Letter } from "@/app/lib/types";
import { InboxRow } from "./InboxRow";

interface InboxListProps {
  letters: Letter[];
  onOpen: (id: string) => void;
}

export function InboxList({ letters, onOpen }: InboxListProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-cream min-h-0" style={{ overscrollBehaviorY: "contain" }} aria-live="polite">
      {letters.map((letter) => (
        <InboxRow key={letter.id} letter={letter} onClick={() => onOpen(letter.id)} />
      ))}
    </div>
  );
}
