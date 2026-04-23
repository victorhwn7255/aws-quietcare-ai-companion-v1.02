"use client";

interface InboxHeaderProps {
  totalCount: number;
  unreadCount: number;
  isDetail: boolean;
  detailDay?: string;
  onBack: () => void;
}

export function InboxHeader({ totalCount, unreadCount, isDetail, detailDay, onBack }: InboxHeaderProps) {
  return (
    <div className="flex items-center gap-1.5 bg-yellow text-black px-[18px] h-[62px] border-b-2 border-black shrink-0">
      {isDetail ? (
        <button
          onClick={onBack}
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
