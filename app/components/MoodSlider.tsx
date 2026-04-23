"use client";

import { MOOD_LABELS } from "@/app/lib/constants";

interface MoodSliderProps {
  value: number;
  onChange: (v: number) => void;
}

export function MoodSlider({ value, onChange }: MoodSliderProps) {
  return (
    <div className="bg-white border-2 border-black" style={{ padding: "16px 18px 14px" }}>
      <div className="relative" style={{ padding: "0 2px" }}>
        {/* Tick labels — padded by half thumb width (11px) to align with slider positions */}
        <div className="flex justify-between font-mono text-[10px] text-text-2" style={{ marginBottom: "6px", padding: "0 11px" }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <span key={n} className="flex flex-col items-center">
              <span className="block bg-black" style={{ width: "2px", height: "6px", marginBottom: "4px" }} />
              {n}
            </span>
          ))}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={1}
          max={7}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mood-slider w-full"
          aria-label={`Mood, 1 (heavy) to 7 (bright)`}
          aria-valuenow={value}
          aria-valuetext={MOOD_LABELS[value]}
        />
      </div>

      {/* Readout */}
      <div className="flex items-baseline justify-between" style={{ marginTop: "12px" }}>
        <span className="text-[22px] font-bold lowercase">{MOOD_LABELS[value]}</span>
        <span className="font-mono text-xs text-text-2">{value} / 7</span>
      </div>
    </div>
  );
}
