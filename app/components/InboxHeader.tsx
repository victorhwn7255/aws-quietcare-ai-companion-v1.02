"use client";

import { DrawerSnap } from "@/app/hooks/useDrawer";

interface InboxHeaderProps {
  totalCount: number;
  unreadCount: number;
  isDetail: boolean;
  detailDay?: string;
  onBack: () => void;
  isMobile?: boolean;
  snap?: DrawerSnap;
  onToggle?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
}

export function InboxHeader({
  totalCount, unreadCount, isDetail, detailDay, onBack,
  isMobile, snap, onToggle, onPointerDown, onPointerMove, onPointerUp,
}: InboxHeaderProps) {
  const isClickable = isMobile && !isDetail;

  return (
    <div
      className={`relative flex items-center gap-1.5 bg-yellow text-black px-[18px] h-[62px] border-b-2 border-black shrink-0 ${
        isClickable ? "cursor-pointer select-none" : ""
      }`}
      onClick={isClickable ? onToggle : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-expanded={isMobile ? snap !== "collapsed" : undefined}
      aria-label={isClickable ? "Toggle inbox" : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle?.(); } } : undefined}
      onPointerDown={isMobile ? onPointerDown : undefined}
      onPointerMove={isMobile ? onPointerMove : undefined}
      onPointerUp={isMobile ? onPointerUp : undefined}
      style={isMobile ? { touchAction: "none" } : undefined}
    >
      {/* Drag handle indicator (mobile only) */}
      {isMobile && !isDetail && (
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-black" aria-hidden="true" />
      )}

      {isDetail ? (
        <button
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          aria-label="Back to inbox"
          className="bg-black text-yellow border-2 border-black font-bold text-xs cursor-pointer mr-1"
          style={{ padding: "2px 10px" }}
        >
          ← Back
        </button>
      ) : (
        <img src="/icon-inbox.svg" alt="Inbox" width={38} height={38} />
      )}
      <h2 className="text-lg font-bold m-0">
        {isDetail ? "Letter" : "Inbox"}
      </h2>
      <div className="ml-auto flex items-center gap-0 border border-white bg-cream font-mono text-[9px]">
        {isDetail ? (
          <span className="px-2 py-0.5 text-black">{detailDay}</span>
        ) : (
          <>
            <span className="px-2 py-0.5 text-black">{totalCount} letters</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-success text-black border-l border-white font-bold">
                {unreadCount} new
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
