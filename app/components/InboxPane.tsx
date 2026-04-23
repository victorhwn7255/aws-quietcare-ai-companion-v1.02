"use client";

import { Letter } from "@/app/lib/types";
import { formatDayName } from "@/app/lib/constants";
import { InboxHeader } from "./InboxHeader";
import { InboxList } from "./InboxList";
import { LetterDetail } from "./LetterDetail";

interface InboxPaneProps {
  letters: Letter[];
  currentLetter: Letter | null;
  unreadCount: number;
  openLetter: (id: string) => void;
  closeLetter: () => void;
}

export function InboxPane({ letters, currentLetter, unreadCount, openLetter, closeLetter }: InboxPaneProps) {
  const detailDay = currentLetter ? formatDayName(currentLetter.date) : undefined;

  return (
    <>
      <InboxHeader
        totalCount={letters.length}
        unreadCount={unreadCount}
        isDetail={!!currentLetter}
        detailDay={detailDay}
        onBack={closeLetter}
      />
      {currentLetter ? (
        <LetterDetail letter={currentLetter} />
      ) : (
        <InboxList letters={letters} onOpen={openLetter} />
      )}
    </>
  );
}
