"use client";

import { useEffect, useRef, useCallback } from "react";
import { Letter } from "@/app/lib/types";
import { formatDayName } from "@/app/lib/constants";
import { useDrawer, DrawerSnap } from "@/app/hooks/useDrawer";
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
  const { snap, setSnap, isMobile, isDragging, drawerRef, contentRef, drawerStyle, contentStyle, handlePointerDown, handlePointerMove, handlePointerUp } = useDrawer();

  // Track previous snap for restoring after letter detail closes
  const prevSnapRef = useRef<DrawerSnap>("half");
  const wasDetailRef = useRef(false);

  // Auto-expand to full when opening a letter on mobile
  useEffect(() => {
    if (!isMobile) return;
    const isDetail = currentLetter !== null;

    if (isDetail && !wasDetailRef.current) {
      // Opening a letter: save current snap, go full
      prevSnapRef.current = snap === "collapsed" ? "half" : snap;
      setSnap("full");
    } else if (!isDetail && wasDetailRef.current) {
      // Closing a letter: restore previous snap
      setSnap(prevSnapRef.current);
    }

    wasDetailRef.current = isDetail;
  }, [currentLetter, isMobile, snap, setSnap]);

  // Toggle handler for header tap
  const handleToggle = useCallback(() => {
    if (snap === "collapsed") {
      setSnap("half");
    } else {
      setSnap("collapsed");
    }
  }, [snap, setSnap]);

  const isCollapsed = snap === "collapsed" && isMobile;

  return (
    <div
      ref={drawerRef}
      style={isMobile ? drawerStyle : undefined}
      className={
        isMobile
          ? `fixed bottom-0 left-0 right-0 h-[100dvh] bg-yellow border-t-2 border-black z-20 flex flex-col ${isDragging ? "drawer-dragging" : "drawer-transition"}`
          : "contents"
      }
    >
      <InboxHeader
        totalCount={letters.length}
        unreadCount={unreadCount}
        isDetail={!!currentLetter}
        detailDay={detailDay}
        onBack={closeLetter}
        isMobile={isMobile}
        snap={snap}
        onToggle={handleToggle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <div
        ref={isMobile ? contentRef : undefined}
        className="flex flex-col flex-1 min-h-0 overflow-hidden"
        style={isMobile ? contentStyle : undefined}
        aria-hidden={isCollapsed}
      >
        {currentLetter ? (
          <LetterDetail letter={currentLetter} />
        ) : (
          <InboxList letters={letters} onOpen={openLetter} />
        )}
      </div>
    </div>
  );
}
