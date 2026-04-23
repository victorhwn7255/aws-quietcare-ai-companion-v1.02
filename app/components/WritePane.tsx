"use client";

import { MoodSlider } from "./MoodSlider";
import { KeywordChips } from "./KeywordChips";
import { LetterComposer } from "./LetterComposer";

interface WritePaneProps {
  mood: number;
  setMood: (v: number) => void;
  keywords: Set<string>;
  toggleKeyword: (k: string) => void;
  body: string;
  setBody: (v: string) => void;
  wordCount: number;
  canSend: boolean;
  isSending: boolean;
  onSend: () => void;
}

export function WritePane({
  mood, setMood, keywords, toggleKeyword, body, setBody, wordCount, canSend, isSending, onSend,
}: WritePaneProps) {
  return (
    <>
      {/* Header — preserved from Phase 1 */}
      <div className="flex items-center gap-1.5 bg-white border-b-2 border-black px-6 h-[62px]">
        <img src="/logo-quietpal.svg" alt="QuietPal" width={38} height={38} />
        <h1 className="text-xl font-bold m-0">QuietPal</h1>
        <div className="ml-auto flex items-center gap-1.5 border border-black bg-cream px-2 py-0.5 font-mono text-[9px] tracking-[0.04em]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success border border-black" />
          </span>
          a safe space to unwind
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: "28px 32px 16px" }}>
        {/* Mood slider */}
        <div className="mb-[22px]">
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase">How&apos;s today</span>
            <span className="font-mono text-[10px] font-normal tracking-normal normal-case text-text-2">drag the slider</span>
          </div>
          <MoodSlider value={mood} onChange={setMood} />
        </div>

        {/* Keywords */}
        <div className="mb-[22px]">
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase">Keywords</span>
            <span className="font-mono text-[10px] font-normal tracking-normal normal-case text-text-2">any that fit</span>
          </div>
          <KeywordChips selected={keywords} onToggle={toggleKeyword} />
        </div>

        {/* Letter */}
        <div className="mb-[22px]">
          <div className="flex items-baseline gap-2.5 mb-2">
            <span className="text-[11px] font-bold tracking-[0.08em] uppercase">Your letter</span>
            <span className="font-mono text-[10px] font-normal tracking-normal normal-case text-text-2">a sentence is enough</span>
          </div>
          <LetterComposer
            body={body}
            onChange={setBody}
            wordCount={wordCount}
            canSend={canSend}
            isSending={isSending}
            onSend={onSend}
          />
        </div>
      </div>
    </>
  );
}
