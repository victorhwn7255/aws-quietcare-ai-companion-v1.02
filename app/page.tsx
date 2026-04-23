"use client";

import { useCallback, useRef } from "react";
import { useDraft } from "@/app/hooks/useDraft";
import { useInbox } from "@/app/hooks/useInbox";
import { WritePane } from "@/app/components/WritePane";
import { InboxPane } from "@/app/components/InboxPane";

export default function Home() {
  const draft = useDraft();
  const inbox = useInbox();
  const sendingRef = useRef(false);

  const handleSend = useCallback(async () => {
    if (sendingRef.current) return;
    if (!draft.canSend) return;
    sendingRef.current = true;

    try {
      const payload = {
        body: draft.body,
        mood: draft.mood,
        keywords: [...draft.keywords],
      };

      // Reset compose pane immediately
      draft.reset();

      // Fire the send (Lambda call + waiting entry)
      await inbox.sendLetter(payload);
    } finally {
      sendingRef.current = false;
    }
  }, [draft, inbox]);

  return (
    <div className="grid grid-cols-[1fr_520px] h-screen min-h-0 max-[900px]:grid-cols-[1fr]">
      {/* ========== LEFT: Write ========== */}
      <section className="flex flex-col min-w-0 min-h-0 overflow-hidden bg-cream max-[900px]:pb-[62px]">
        <WritePane
          mood={draft.mood}
          setMood={draft.setMood}
          keywords={draft.keywords}
          toggleKeyword={draft.toggleKeyword}
          body={draft.body}
          setBody={draft.setBody}
          wordCount={draft.wordCount}
          canSend={draft.canSend}
          isSending={inbox.isSending}
          onSend={handleSend}
        />
      </section>

      {/* ========== RIGHT: Inbox ========== */}
      <aside className="flex flex-col min-w-0 min-h-0 overflow-hidden bg-yellow border-l-2 border-black max-[900px]:contents">
        <InboxPane
          letters={inbox.letters}
          currentLetter={inbox.currentLetter}
          unreadCount={inbox.unreadCount}
          openLetter={inbox.openLetter}
          closeLetter={inbox.closeLetter}
        />
      </aside>
    </div>
  );
}
