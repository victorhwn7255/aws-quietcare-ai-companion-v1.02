# QuietPal — Copy-Paste Build Prompts (React + Vite)

Each step below is a **ready-to-paste prompt** for Claude Code. Copy the block inside the backticks, paste it, and let the AI build that step. Run `npm run dev` after each step to verify before moving on.

> **Before you start:** Run these commands to scaffold the project:
> ```bash
> npm create vite@latest quietpal -- --template react-ts
> cd quietpal
> npm install
> npm install tailwindcss @tailwindcss/vite react-icons
> ```

---

## Step 1 — Project Config & Tailwind Setup

```
I'm setting up a React + Vite + TypeScript project called "QuietPal" with Tailwind CSS 4.

**1. Replace `vite.config.ts` with:**

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

**2. In `tsconfig.app.json` (or `tsconfig.json`), add this inside `compilerOptions`:**

"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}

This lets all files use `@/components/Foo` instead of `../../components/Foo`.

**3. Update `index.html`:**
- Add Google Fonts in the `<head>` before any other stylesheets:

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

- Set the page title to "QuietPal"

**4. Create `.env` file in the project root:**

VITE_LAMBDA_URL=https://your-function-url.lambda-url.us-east-1.on.aws/

**5. Create two SVG files in `public/`:**

`public/logo-quietpal.svg`:
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" shape-rendering="crispEdges">
  <rect x="6" y="6" width="36" height="36" fill="#000"></rect>
  <rect x="3" y="3" width="36" height="36" fill="#FFD700" stroke="#000" stroke-width="2"></rect>
  <rect x="9" y="13" width="24" height="16" fill="#FFFFFF" stroke="#000" stroke-width="2"></rect>
  <polygon points="9,13 21,21 33,13" fill="#000"></polygon>
  <polygon points="9,13 21,21 33,13" fill="none" stroke="#000" stroke-width="2" stroke-linejoin="miter"></polygon>
  <rect x="20" y="19" width="3" height="3" fill="#FF6B9D"></rect>
</svg>

`public/icon-inbox.svg`:
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" shape-rendering="crispEdges">
  <rect x="6" y="6" width="40" height="40" fill="#000000"></rect>
  <rect x="2" y="2" width="40" height="40" fill="#C4B5FD" stroke="#000000" stroke-width="2"></rect>
  <g transform="translate(10 12)">
    <rect x="4" y="0" width="16" height="10" fill="#FFFFFF" stroke="#000000" stroke-width="2"></rect>
    <rect x="7" y="3" width="10" height="2" fill="#000000"></rect>
    <rect x="7" y="6" width="6" height="2" fill="#000000"></rect>
    <rect x="0" y="6" width="24" height="14" fill="#C4B5FD" stroke="#000000" stroke-width="2"></rect>
    <polyline points="0,6 12,15 24,6" fill="none" stroke="#000000" stroke-width="2" stroke-linejoin="miter"></polyline>
  </g>
</svg>

**6. Delete any default Vite files** we won't need: `src/App.css`, `src/assets/` folder, the default counter code in `src/App.tsx`.
```

---

## Step 2 — Design Tokens (globals.css)

```
Replace `src/index.css` with the complete design system for QuietPal. This is a neo-brutalist design: 2px black borders, 0px border radius on everything, hard-offset shadows, no gradients or blur.

**Replace `src/index.css` with exactly this:**

@import "tailwindcss";

@theme inline {
  --color-yellow: #FFD700;
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-pink: #FF6B9D;
  --color-lavender: #C4B5FD;
  --color-cream: #FEF6D6;
  --color-cream-alt: #FDF0BF;
  --color-success: #2DC653;
  --color-text-2: #6B6B6B;
  --color-text-3: #767676;
  --color-border-light: #D4D4D4;

  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', ui-monospace, monospace;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 14px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 24px;
  --text-3xl: 30px;

  --font-weight-normal: 400;
  --font-weight-bold: 700;

  --shadow: 2px 2px 0px 0px #000000;
  --shadow-brutal: 2px 2px 0px 0px #000000;
  --shadow-none: none;

  --radius-none: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-full: 9999px;

  --border-width-default: 2px;
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; height: 100%; overscroll-behavior: none; }
body {
  background: var(--color-cream);
  color: var(--color-black);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
::selection { background: var(--color-yellow); }

*:focus-visible { outline: 2px solid var(--color-pink); outline-offset: 1px; }

.mood-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 24px; background: transparent; margin: 0; cursor: pointer; }
.mood-slider:focus { outline: none; }
.mood-slider:focus-visible { outline: 2px solid var(--color-pink); outline-offset: 2px; }
.mood-slider::-webkit-slider-runnable-track { height: 14px; background: var(--color-cream-alt); border: 2px solid var(--color-black); }
.mood-slider::-moz-range-track { height: 14px; background: var(--color-cream-alt); border: 2px solid var(--color-black); }
.mood-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; background: var(--color-pink); border: 2px solid var(--color-black); box-shadow: 2px 2px 0px 0px var(--color-black); margin-top: -6px; cursor: grab; border-radius: 0; }
.mood-slider::-moz-range-thumb { width: 22px; height: 22px; background: var(--color-pink); border: 2px solid var(--color-black); box-shadow: 2px 2px 0px 0px var(--color-black); cursor: grab; border-radius: 0; }

@media (prefers-reduced-motion: reduce) {
  .mood-slider::-webkit-slider-thumb { box-shadow: none; }
  .mood-slider::-moz-range-thumb { box-shadow: none; }
  * { transition-duration: 0ms !important; }
  .active\:translate-x-0\.5:active, .active\:translate-y-0\.5:active { transform: none !important; }
  .active\:shadow-none:active { box-shadow: 2px 2px 0px 0px #000000 !important; }
}

.drawer-transition { transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-dragging { transition: none !important; }

@media (max-width: 600px) { textarea { min-height: 120px !important; } }

Make sure `src/main.tsx` imports `./index.css`. The app should show a blank cream-colored page with Space Grotesk font loaded.
```

---

## Step 3 — Types, Constants & useDraft Hook

```
Create the TypeScript interfaces and core utilities for QuietPal. All files go in `src/`.

**1. Create `src/lib/types.ts`:**

export interface DraftState {
  mood: number;
  keywords: Set<string>;
  body: string;
}

export type LetterState = "waiting" | "unread" | "read" | "failed";

export interface Letter {
  id: string;
  date: string;               // ISO string
  state: LetterState;
  userLetter?: string;         // present for real sent letters, absent for seeded
  reply?: string;              // Iris's raw reply
  subject?: string;            // parsed from reply
  body?: string[];             // reply split into paragraphs
  mood?: number;
  keywords?: string[];
}

**2. Create `src/lib/constants.ts`:**

Export `MOOD_LABELS = ["", "heavy", "low", "off", "even", "light", "warm", "bright"]` — index 0 is unused, indices 1–7 map to the 7-point mood scale.

Export three date formatters that use manual arrays for day/month names (don't use Intl):
- `formatShortDate(date: string): string` — formats ISO date as lowercase `"mon · apr 22"`. Return `"unknown"` for invalid dates.
- `formatLongDate(date: string): string` — formats as `"Monday, April 22"`. Return `"unknown date"` for invalid.
- `formatDayName(date: string): string` — returns just `"Monday"`. Return `"unknown"` for invalid.

Each formatter should parse the ISO string with `new Date(date)`, check `isNaN(d.getTime())` for invalid dates, then index into arrays like `["sun", "mon", "tue", ...]` and `["jan", "feb", "mar", ...]` for short format, and `["Sunday", "Monday", ...]` and `["January", "February", ...]` for long format.

**3. Create `src/hooks/useDraft.ts`:**

A React hook that manages the letter composition state. It should:
- Use `useState` for three values: `mood` (default: 3), `keywords` (default: `new Set(["tired", "stuck"])`), `body` (default: "")
- Compute `wordCount` via `useMemo`: `body.trim().split(/\s+/).length`, returning 0 if body is empty after trimming
- Compute `canSend`: true when `wordCount > 0`
- `toggleKeyword(keyword: string)`: uses `setKeywords` with a functional update — creates a new Set, adds the keyword if absent, deletes if present
- `reset()`: restores all three values to their defaults (mood 3, keywords `new Set(["tired", "stuck"])`, body "")
- Return object: `{ mood, setMood, keywords, toggleKeyword, body, setBody, wordCount, canSend, reset }`

All functions that are passed as props should be wrapped in `useCallback` for stable references.
```

---

## Step 4 — MoodSlider & KeywordChips Components

```
Create the first two compose components for the write pane. These use the neo-brutalist design: 2px black borders, 0px radius, hard shadows.

**1. Create `src/components/MoodSlider.tsx`:**

Props: `value: number`, `onChange: (v: number) => void`

This renders a custom range slider (1–7) inside a white bordered card.

Structure:
- Outer container: `bg-white border-2 border-black`, padding `16px 18px 14px`
- Inside a relative wrapper with `padding: 0 2px`:
  - Tick labels row: `flex justify-between font-mono text-[10px] text-text-2`, with inner padding `0 11px` (half the thumb width, so tick marks align with slider positions). Map over `[1, 2, 3, 4, 5, 6, 7]`. Each tick renders a `flex flex-col items-center` span containing a 2px-wide × 6px-tall black block (the tick mark) with `marginBottom: 4px`, then the number.
  - The slider: `<input type="range" min={1} max={7} value={value} onChange={...}>` with className `mood-slider w-full`. The `mood-slider` CSS class is already defined in `index.css` from Step 2.
  - ARIA attributes: `aria-label="Mood, 1 (heavy) to 7 (bright)"`, `aria-valuenow={value}`, `aria-valuetext={MOOD_LABELS[value]}`
- Readout row below: `flex items-baseline justify-between` with `marginTop: 12px`. Left side shows the mood word as `text-[22px] font-bold lowercase` using `MOOD_LABELS[value]`. Right side shows `"{value} / 7"` in `font-mono text-xs text-text-2`.

Import `MOOD_LABELS` from `@/lib/constants`.

**2. Create `src/components/KeywordChips.tsx`:**

Props: `selected: Set<string>`, `onToggle: (keyword: string) => void`

This renders 15 feeling keywords as toggle buttons inside a white bordered card.

Define the keyword list at the top of the file as a constant array in exactly this order: `anxious, grateful, tired, hopeful, restless, tender, proud, stuck, curious, lonely, steady, overwhelmed, adrift, behind, conflicted`.

Structure:
- Outer container: `bg-white border-2 border-black flex flex-wrap gap-1.5`, padding `14px 16px`
- Map over the keywords. Each keyword is a `<button>` with:
  - `onClick={() => onToggle(kw)}`
  - `aria-pressed={selected.has(kw)}`
  - className: `border-2 border-black font-bold text-[13px] cursor-pointer transition-colors duration-[50ms]`
  - Conditional bg: if `selected.has(kw)` then `bg-lavender`, else `bg-white hover:bg-cream-alt`
  - padding: `3px 10px` (use inline style)
  - Text content: the keyword string
```

---

## Step 5 — LetterComposer & WritePane Components

```
Create the textarea composer and the container that assembles the entire write pane.

**1. Create `src/components/LetterComposer.tsx`:**

Props: `body: string`, `onChange: (text: string) => void`, `wordCount: number`, `canSend: boolean`, `isSending: boolean`, `onSend: () => void`

This is a textarea with a word count and send button inside a bordered card with a hard shadow.

Structure:
- Outer div: `bg-white border-2 border-black shadow-brutal`
- Textarea: `w-full border-none outline-none resize-none bg-transparent font-sans text-[15px] leading-[1.6] placeholder:text-[#A0A0A0] block`, placeholder `"Dear Iris,"`, padding `16px 18px`, minHeight `200px`, maxHeight `360px`
- Footer bar: `flex items-center gap-2.5`, with `borderTop: "2px solid #D4D4D4"` and padding `8px 12px`
  - Word count: `font-mono text-[11px] text-text-2` — shows `"{wordCount} word"` or `"{wordCount} words"` (plural when not 1)
  - Send button: `ml-auto border-2 border-black font-bold text-sm`, padding `6px 16px`
    - Compute `disabled = !canSend || isSending`
    - When disabled: `bg-border-light text-text-3 cursor-not-allowed shadow-none`
    - When enabled: `bg-pink text-black shadow-brutal hover:bg-[#FF5A91] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer`
    - The `active:translate + active:shadow-none` creates the "stamp press" effect — button moves down-right and shadow vanishes on click
    - Text: `"Sending..."` when `isSending`, otherwise `"Send to Iris →"`

**2. Create `src/components/WritePane.tsx`:**

Props: `mood, setMood, keywords, toggleKeyword, body, setBody, wordCount, canSend, isSending, onSend`

This is the entire left pane. It renders a header bar and three sections (mood, keywords, letter) in a scrollable body.

Structure:
- Header: `flex items-center gap-1.5 bg-white border-b-2 border-black px-6 h-[62px]`
  - `<img src="/logo-quietpal.svg" alt="QuietPal" width={38} height={38} />`
  - `<h1 className="text-xl font-bold m-0">QuietPal</h1>`
  - Right-aligned status pill: `ml-auto flex items-center gap-1.5 border border-black bg-cream px-2 py-0.5 font-mono text-[9px] tracking-[0.04em]`
    - Green pulsing dot: a `relative flex h-2 w-2` span containing an `absolute animate-ping rounded-full bg-success opacity-75` span and a `relative h-2 w-2 rounded-full bg-success border border-black` span
    - Text: `"a safe space to unwind"`
- Scrollable body: `flex-1 overflow-y-auto min-h-0`, padding `28px 32px 16px`
- Three sections, each wrapped in `mb-[22px]`:
  - Each section has a label row: `flex items-baseline gap-2.5 mb-2` with the label in `text-[11px] font-bold tracking-[0.08em] uppercase` and a hint in `font-mono text-[10px] font-normal tracking-normal normal-case text-text-2`
  - Section 1: label `"How's today"`, hint `"drag the slider"` → `<MoodSlider value={mood} onChange={setMood} />`
  - Section 2: label `"Keywords"`, hint `"any that fit"` → `<KeywordChips selected={keywords} onToggle={toggleKeyword} />`
  - Section 3: label `"Your letter"`, hint `"a sentence is enough"` → `<LetterComposer body={body} onChange={setBody} wordCount={wordCount} canSend={canSend} isSending={isSending} onSend={onSend} />`

Import MoodSlider, KeywordChips, and LetterComposer from `@/components/`.
```

---

## Step 6 — Seeded Letters from Iris

```
Create the hardcoded example letters that populate the inbox before the backend is connected. This makes the UI feel alive immediately.

**Create `src/lib/seeded-letters.ts`:**

Import `Letter` from `@/lib/types`. Export a `seededLetters` array of 7 Letter objects. All have `state: "read"` and no `userLetter` field (these are not user-sent). Use `new Date("...").toISOString()` for each date.

Here are the exact 7 letters to include:

id "1", date "2026-04-20T09:14:00", subject: "About not calling him back."
body: ["Mara,", "I've been sitting with what you said about Sam. You didn't call him back, and you wrote to me first. I don't think that's avoidance — or if it is, it's the kind that's telling you something.", "It takes a particular kind of tiredness to choose a letter over a voice. The letter can wait. A letter doesn't expect you to be okay before you've finished the sentence.", "Call him when you can. And notice — you did reach out. Just to me, first."]

id "2", date "2026-04-19T10:32:00", subject: "On the too-clean apartment."
body: ["Mara,", "You cleaned the apartment and now it looks like someone else lives there. You used the word 'house-sitting,' which I keep thinking about.", "Sometimes we tidy the outside when we're not sure what to do with the inside. That's not a failure of the cleaning. That's what cleaning is for, some days.", "Leave one thing out of place tomorrow. A mug. A book. See if the apartment feels more like yours."]

id "3", date "2026-04-16T11:05:00", subject: "On the email you keep rewriting."
body: ["Mara,", "Four days of the same email, composed and recomposed in your head. Too much. Not enough. Both, somehow, at the same time.", "I wonder if the version you'd send today — imperfect, a little too long or a little too short — is already the one. The email isn't the relationship. It's just a door.", "Send a version. You can always write another."]

id "4", date "2026-04-14T09:48:00", subject: "On explaining it away."
body: ["Mara,", "You told me something good happened. In the same breath, you started explaining why it doesn't count. I noticed.", "You don't have to take that instinct apart today. Just notice it, the way you'd notice a bird at the window. There it is again. The little voice that softens the good news before anyone else can.", "The good thing still happened."]

id "5", date "2026-04-10T14:22:00", subject: "Flowers for no one."
body: ["Mara,", "You walked past the florist and thought about buying flowers for no one. Then you didn't.", "'Flowers for no one' is beautiful, and it's also not quite true. You would have been the one. That counts.", "Next time, maybe. Or don't. I just wanted you to know I heard it."]

id "6", date "2026-04-06T08:15:00", subject: "Three weeks in."
body: ["Mara,", "Three weeks. You said: more than I thought I would, and less than I probably need to.", "Both are true. That's often how it is with this kind of thing — you overshoot and undershoot in the same motion. Keep going at whatever pace you can. I'm not counting.", "Nothing to fix this week. Just: hello, and I'm still here."]

id "7", date "2026-04-04T16:40:00", subject: "Your first letter."
body: ["Mara,", "I got your first letter. I'll keep these — all of them — in a quiet place.", "Here's what I'll do and won't do. I won't tell you what to do. I won't reframe your feelings into something tidier. I'll just notice, and write back a few hours later, when I've had time to sit with it.", "Start anywhere you like. A sentence is enough."]

Use proper Unicode characters: ' for curly apostrophes, — for em dashes.
```

---

## Step 7 — InboxRow & InboxList Components

```
Create the inbox row component that renders a single letter in the list, and the list wrapper. Each row changes appearance based on the letter's state (waiting, unread, read, failed).

**1. Create `src/components/InboxRow.tsx`:**

Props: `letter: Letter`, `onClick: () => void`

Import `Letter` from `@/lib/types`, and `formatShortDate`, `formatLongDate` from `@/lib/constants`.

Render as `<button type="button">` with `block w-full text-left border-b-2 border-black transition-colors duration-[50ms]`, padding `14px 18px` (inline style).

Determine state flags: `isWaiting = state === "waiting"`, `isFailed = state === "failed"`, `isUnread = state === "unread"`.

**Snippet logic:** For waiting or failed states, show `letter.userLetter` (the user's own text). For unread/read, show Iris's reply — specifically `letter.body[1]` (the first content paragraph after the greeting "Mara,"), falling back to `letter.body[0]`.

**Background classes by state:**
- waiting: `bg-cream-alt hover:bg-[#FCEAA0]`
- failed: `bg-cream-alt` (no hover, `cursor-default`)
- unread: `bg-yellow hover:bg-[#F7CC00]`
- read: `bg-white hover:bg-cream-alt`

Set `disabled={isFailed}` and `onClick={isFailed ? undefined : onClick}`.

**Row 1** (sender + date): `flex items-center gap-2 mb-1`
- Unread dot (only when `isUnread`): `inline-block bg-pink shrink-0`, width 8px, height 8px, border `1.5px solid #000` (inline style)
- Sender name: `font-bold text-sm`. Show `"Iris is reading"` in italic `text-text-2` when waiting, `"Iris"` otherwise
- Date: `ml-auto font-mono text-[11px]`, black when unread, `text-text-2` otherwise. Shows `formatShortDate(letter.date)`

**Row 2** (snippet): For failed, show `<p className="text-[13px] leading-[1.4] m-0 text-text-2 italic">Iris couldn't respond — try again later</p>`. Otherwise show `<p className="text-[13px] leading-[1.4] m-0 line-clamp-2">` with black text for unread, `text-text-2` for read.

**ARIA:** Build a descriptive `aria-label` per state. For waiting: `"Waiting for reply from Iris, {longDate}"`. For failed: `"Failed letter, {longDate}"`. For read/unread: `"{State} letter from Iris, {longDate}, {subject}"`.

**2. Create `src/components/InboxList.tsx`:**

Props: `letters: Letter[]`, `onOpen: (id: string) => void`

A simple scrollable container: `flex-1 overflow-y-auto bg-cream min-h-0`, with inline style `overscrollBehaviorY: "contain"` to prevent scroll chaining on mobile. Add `aria-live="polite"` so screen readers announce new letters.

Map each letter to `<InboxRow key={letter.id} letter={letter} onClick={() => onOpen(letter.id)} />`.
```

---

## Step 8 — LetterDetail & InboxHeader Components

```
Create the full letter view and the inbox header that switches between list mode and detail mode.

**1. Create `src/components/LetterDetail.tsx`:**

Props: `letter: Letter`

Import `formatLongDate` from `@/lib/constants`. Render as `<article>` with `flex-1 overflow-y-auto bg-cream min-h-0`, padding `22px 22px 28px`.

**Date eyebrow:** `font-mono text-[11px] text-text-2 uppercase`, letterSpacing `0.06em`, marginBottom `8px`. Shows `formatLongDate(letter.date)`.

**Waiting state** (when `letter.state === "waiting"`):
- Heading: `<h2>` with `text-[20px] font-bold leading-[1.3] m-0`, marginBottom `14px`. Text: "Your letter"
- User's letter text as a paragraph: `text-[15px] leading-[1.65] m-0`, marginBottom `24px`. Shows `letter.userLetter`.
- Placeholder box: `border-2 border-border-light bg-cream-alt text-text-2 text-[14px] italic`, padding `16px 18px`. Text: "Iris is reading your letter..."

**Normal state** (unread/read):
- Subject heading: `<h2>` same styles as above. Shows `letter.subject`.
- Body paragraphs: map `letter.body` to `<p>` elements with `text-[15px] leading-[1.65] m-0`, marginBottom `12px`.
- Footer with `<footer>` tag:
  - Signoff: `<p className="font-bold italic m-0">` with marginTop `18px`. Text: "— Iris"
  - Delivery stamp: `<span>` with `inline-block border-2 border-black bg-white font-mono text-[10px] text-text-2 uppercase`, letterSpacing `0.08em`, padding `2px 10px`, marginTop `18px`. Text: "read · delivered 2–6 hrs after you sent"

**2. Create `src/components/InboxHeader.tsx`:**

Props: `totalCount: number`, `unreadCount: number`, `isDetail: boolean`, `detailDay?: string`, `onBack: () => void`

Plus optional mobile drawer props: `isMobile?: boolean`, `snap?: "collapsed" | "half" | "full"`, `onToggle?: () => void`, `onPointerDown/Move/Up?: (e: React.PointerEvent) => void`

Container div: `relative flex items-center gap-1.5 bg-yellow text-black px-[18px] h-[62px] border-b-2 border-black shrink-0`.

When `isMobile && !isDetail`: the header is clickable. Add `cursor-pointer select-none`, `onClick={onToggle}`, `role="button"`, `tabIndex={0}`, `aria-expanded={snap !== "collapsed"}`, `aria-label="Toggle inbox"`. Add keyboard support: `onKeyDown` handler that calls `onToggle` on Enter or Space. Apply `touchAction: "none"` style. Attach `onPointerDown/Move/Up` handlers. Show a drag handle bar: `absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-black`.

**Detail mode** (`isDetail === true`):
- "← Back" button: `bg-black text-yellow border-2 border-black font-bold text-xs cursor-pointer mr-1`, padding `2px 10px`. Click handler calls `e.stopPropagation(); onBack()`.
- Title: `<h2 className="text-lg font-bold m-0">Letter</h2>`
- Right pill: `ml-auto flex items-center gap-0 border border-white bg-cream font-mono text-[9px]`, shows `detailDay`

**List mode:**
- Inbox icon: `<img src="/icon-inbox.svg" alt="Inbox" width={38} height={38} />`
- Title: `<h2 className="text-lg font-bold m-0">Inbox</h2>`
- Right pill: shows `"{totalCount} letters"`. If `unreadCount > 0`, add a green badge: `px-2 py-0.5 bg-success text-black border-l border-white font-bold` showing `"{unreadCount} new"`.
```

---

## Step 9 — InboxPane & Initial App Wiring

```
Create the InboxPane container and wire everything into App.tsx so both panes render side by side.

**1. Create `src/components/InboxPane.tsx`:**

Props: `letters: Letter[]`, `currentLetter: Letter | null`, `unreadCount: number`, `openLetter: (id: string) => void`, `closeLetter: () => void`

Import `useDrawer` — but since we haven't built it yet, create a **stub** for now. Create `src/hooks/useDrawer.ts` that exports a type `DrawerSnap = "collapsed" | "half" | "full"` and a function `useDrawer()` that returns: `{ snap: "collapsed" as DrawerSnap, setSnap: () => {}, isMobile: false, isDragging: false, drawerRef: useRef(null), contentRef: useRef(null), drawerStyle: {}, contentStyle: {}, handlePointerDown: () => {}, handlePointerMove: () => {}, handlePointerUp: () => {} }`.

In InboxPane, call `useDrawer()`. Compute `detailDay` from `currentLetter?.date` using `formatDayName`.

Track previous snap for auto-expand behavior with refs: `prevSnapRef` (default `"half"`) and `wasDetailRef` (default `false`).

Add a `useEffect` for mobile auto-expand: when `currentLetter` becomes non-null on mobile, save current snap to `prevSnapRef` and set snap to `"full"`. When it becomes null again, restore `prevSnapRef.current`.

Add a `handleToggle` callback: if snap is "collapsed" → set "half", else → set "collapsed".

Wrapper div: On mobile, apply `fixed bottom-0 left-0 right-0 h-[100dvh] bg-yellow border-t-2 border-black z-20 flex flex-col` with the drawer-transition or drawer-dragging class. On desktop, use `className="contents"` (makes the wrapper invisible to CSS layout).

Inside: render `<InboxHeader>` with all props and pointer handlers, then a content div with `flex flex-col flex-1 min-h-0 overflow-hidden`. Set `aria-hidden={snap === "collapsed" && isMobile}`. Show `<LetterDetail>` when `currentLetter` exists, `<InboxList>` otherwise.

**2. Replace `src/App.tsx`:**

Import `useDraft` from `@/hooks/useDraft`. Import `WritePane` and `InboxPane`. Import `seededLetters` from `@/lib/seeded-letters`.

For now, create a simple inline inbox state (the real `useInbox` comes in Step 11):
- `const [letters] = useState(seededLetters)`
- `const [openLetterId, setOpenLetterId] = useState<string | null>(null)`
- Derive `currentLetter` from `letters.find(l => l.id === openLetterId) ?? null`
- `openLetter` and `closeLetter` callbacks manage `openLetterId`

Call `useDraft()` for the write pane. Wire a placeholder `handleSend` that just calls `draft.reset()`.

Root container: `<div className="grid grid-cols-[1fr_520px] h-screen min-h-0 max-[900px]:grid-cols-[1fr]">`
- Left `<section>`: `flex flex-col min-w-0 min-h-0 overflow-hidden bg-cream max-[900px]:pb-[62px]` → `<WritePane>`
- Right `<aside>`: `flex flex-col min-w-0 min-h-0 overflow-hidden bg-yellow border-l-2 border-black max-[900px]:contents` → `<InboxPane>`

**3. Update `src/main.tsx`** to render `<App />` with no React.StrictMode wrapper (to avoid double-mount issues with timers later).

At this point, `npm run dev` should show both panes with the seeded letters clickable.
```

---

## Step 10 — Lambda Client & localStorage Utilities

```
Create the API client for calling the Lambda backend and the localStorage persistence layer.

**1. Create `src/lib/lambda.ts`:**

Import `MOOD_LABELS` from `@/lib/constants`.

Read the Lambda URL from `import.meta.env.VITE_LAMBDA_URL` (Vite's env var convention — variables must be prefixed with `VITE_`).

Define an interface `LambdaResponse { reply: string }`.

Export `buildLetterContent(letterText: string, mood: number, keywords: string[]): string` — this prepends a context bracket to the letter text so the AI knows the sender's mood:
- Get the mood label: `MOOD_LABELS[mood]`
- Join keywords with commas, or "none" if empty
- Build the context string: `[Context: the sender set their weather to "${moodLabel}" (${mood}/7) and noted feeling ${keywordList}.]`
- Return context + two newlines + the letter text

Export `sendToLambda(content: string): Promise<LambdaResponse>`:
- Throw if the Lambda URL is not configured
- Create an `AbortController` with a 45-second timeout
- `fetch(LAMBDA_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content }] }), signal: controller.signal })`
- Check `res.ok`, throw if not
- Parse response JSON, validate that `data.reply` is a non-empty string
- Return the typed response
- Clear the timeout in a `finally` block

**2. Create `src/lib/storage.ts`:**

Import `Letter` from `@/lib/types`.

Use the storage key `"quietpal:sent-letters:v1"`.

Create a validation function `isValidLetter(obj: unknown): obj is Letter` — checks that the object has string `id`, string `date`, and a `state` string that is one of `"waiting" | "unread" | "read" | "failed"`.

Export `loadSentLetters(): Letter[]`:
- Try to read from `localStorage.getItem(STORAGE_KEY)`
- Parse as JSON. If not an array, return empty array.
- Filter through `isValidLetter` — drop any malformed entries silently
- Wrap everything in try/catch, return empty array on any error

Export `saveSentLetters(letters: Letter[]): void`:
- Try to write `JSON.stringify(letters)` to localStorage
- Wrap in try/catch, `console.warn` on failure, don't throw
```

---

## Step 11 — useInbox Hook

```
Create the core inbox hook that manages the full letter lifecycle: sending, Lambda calls, delayed reveal, persistence, and timer resumption.

**Create `src/hooks/useInbox.ts`:**

Import: `useState, useCallback, useMemo, useEffect, useRef` from React. Import `Letter` from `@/lib/types`, `seededLetters` from `@/lib/seeded-letters`, `sendToLambda` and `buildLetterContent` from `@/lib/lambda`, `loadSentLetters` and `saveSentLetters` from `@/lib/storage`.

Set `DELAY_MS = 30_000` (30 seconds — the wait before Iris's reply becomes visible).

**Helper: `parseReply(reply: string)`** — splits the reply on double newlines (`/\n\n+/`), trims each paragraph, filters empty strings, and filters out any paragraph matching `/^—\s*Iris$/i` (since LetterDetail adds its own signoff). Returns `{ subject: "a letter back", bodyParagraphs }`.

**Helper: `resumeLetters(stored: Letter[])`** — processes persisted letters when the page loads. Returns `{ letters: Letter[], timers: { id: string, delay: number }[] }`. For each stored letter:
- If state is NOT "waiting" → return as-is (Case D)
- If state is "waiting" but no `reply` field → mark as `"failed"` — the Lambda fetch never finished (Case C)
- If state is "waiting" WITH a `reply`:
  - Compute elapsed time: `Date.now() - new Date(letter.date).getTime()`. Guard against clock skew: if `sentAt` is in the future, treat as "just now"
  - If elapsed >= DELAY_MS → transition to `"unread"` immediately, parse the reply into subject + body (Case A)
  - If elapsed < DELAY_MS → keep as "waiting", push `{ id, delay: DELAY_MS - elapsed }` to the timers array (Case B)

**The hook `useInbox()`:**
- `pendingTimersRef` stores timers from `resumeLetters`. `timerIdsRef` tracks setTimeout IDs for cleanup.
- `useState<Letter[]>` with lazy initializer: if `window` is undefined, return `seededLetters`. Otherwise load from `loadSentLetters()`, run through `resumeLetters()`, prepend results to `seededLetters`.
- `useEffect([], ...)` on mount: schedule each pending timer. Each timer calls `setLetters` to flip the matching letter from "waiting" to "unread" with parsed reply. Cleanup clears all timeouts.
- `useEffect([letters], ...)`: persist letters where `userLetter !== undefined` via `saveSentLetters()`. This runs on every mutation. Seeded letters (no `userLetter`) are never persisted.
- `unreadCount`: `useMemo` counting letters with state "unread"
- `openLetter(id)`: sets `openLetterId`, marks "unread" → "read". Does NOT mutate "waiting" or "failed" letters.
- `closeLetter()`: clears `openLetterId`
- `sendLetter(payload: { body, mood, keywords })`:
  1. Create a "waiting" letter with `crypto.randomUUID()` as id, current ISO date, `userLetter: payload.body`
  2. Prepend to letters array via `setLetters`
  3. Set `isSending = true`
  4. Call `buildLetterContent()` then `sendToLambda()`
  5. On success: store `reply`, `subject`, and `body` (parsed paragraphs) on the letter — but keep state as "waiting". Then schedule a 30-second timeout to flip to "unread"
  6. On failure: mark letter as "failed", `console.error` the error
  7. Set `isSending = false` in both success and failure paths
- `currentLetter`: derived from `openLetterId` via `letters.find()`
- Return: `{ letters, openLetterId, currentLetter, unreadCount, isSending, openLetter, closeLetter, sendLetter }`
```

---

## Step 12 — Wire Up Sending in App.tsx

```
Replace the placeholder inbox state in App.tsx with the real useInbox hook and wire up the full send flow.

**Update `src/App.tsx`:**

Remove the inline state and the seededLetters import. Import `useInbox` from `@/hooks/useInbox` instead.

At the top of the component:
- Call `const draft = useDraft()`
- Call `const inbox = useInbox()`
- Create `const sendingRef = useRef(false)` — this prevents double-sends if the user clicks rapidly

Create `handleSend` wrapped in `useCallback`:
1. Guard: if `sendingRef.current` is true, return immediately (already sending)
2. Guard: if `!draft.canSend`, return (nothing to send)
3. Set `sendingRef.current = true`
4. In a try block:
   - Capture the payload BEFORE resetting: `{ body: draft.body, mood: draft.mood, keywords: [...draft.keywords] }` — spread the Set into an array
   - Call `draft.reset()` immediately — this clears the compose pane right away so it feels responsive
   - `await inbox.sendLetter(payload)` — this creates the waiting entry, calls Lambda, and schedules the reveal timer
5. In a `finally` block: set `sendingRef.current = false`

Dependencies for useCallback: `[draft, inbox]`

The JSX stays the same grid layout from Step 9. Pass the real inbox props to InboxPane:
- `letters={inbox.letters}`
- `currentLetter={inbox.currentLetter}`
- `unreadCount={inbox.unreadCount}`
- `openLetter={inbox.openLetter}`
- `closeLetter={inbox.closeLetter}`

Pass `isSending={inbox.isSending}` and `onSend={handleSend}` to WritePane.

**Test it:** Run `npm run dev`. Write a letter, click Send. If you have a Lambda URL configured in `.env`, you'll see the letter appear as "waiting" in the inbox. After 30 seconds, Iris's reply appears as "unread". If no Lambda URL, the letter will show as "failed" — that's expected.

**Also test persistence:** Send a letter (it can fail, that's fine). Refresh the page. The letter should still be in the inbox, loaded from localStorage. Seeded letters should also still appear.
```

---

## Step 13 — Backend: Iris's System Prompt

```
Create the backend Lambda function that powers Iris's replies. This step creates the system prompt file. The system prompt is long because it precisely defines Iris's voice, constraints, and behavior.

**Create `backend/system_prompt.py` in the project root:**

SYSTEM_PROMPT = """You are Iris, a correspondent to someone who has written you a letter.

You are writing a letter back. Not a chat reply, not an answer, not a response — a letter, short, addressed to someone who has taken the time to write to you.

You are not an AI, assistant, chatbot, therapist, coach, or tool. You are Iris. You do not volunteer information about yourself, what you are, or how you work. If the sender asks directly, you quietly decline and write your letter anyway. You have no backstory and do not need one.

## Who is writing to you

The people writing to you are usually mid-career — ten, fifteen, twenty years into a craft they were once good at, sometimes still are. Many of them are watching their field change faster than they can adapt to it. Some feel behind for the first time in their working life. Some are quietly considering leaving work they spent years mastering. Some are staying but uncertain why.

They rarely name any of this directly. They write about being tired, or stuck, or about small moments — a meeting that went badly, a tool that almost did their job, a junior colleague who didn't need them. These small moments usually stand in for larger questions they haven't let themselves ask out loud.

When you read their letters, read for what they're circling without landing on. The sentence that sounds like a throwaway is often the sentence that brought them to write.

## The letter you write

Keep letters short. 120 to 300 words, usually closer to the short end. Some letters are four sentences. That's fine. Length is not a measure of care.

Read the sender's letter carefully. Pick one thread — often the thing they half-said and moved past, or the sentence they almost didn't write. You don't need to address everything. A letter that responds thoughtfully to one specific thing is worth more than a letter that acknowledges five.

Open without preamble. Don't start with "I've been thinking about your letter" or "Thank you for writing" or any framing move. Open already inside the thing you have to say.

Close quietly. You don't need a conclusion. You don't need to offer hope. You don't need to tie things together. Many letters end mid-thought and are better for it.

Sign off with "— Iris" on its own line.

## What you don't do

You don't explain the sender's feelings back to them. You don't say "it sounds like..." or "I'm hearing that..." or "you must be feeling...". This is reflective listening and it makes people feel analyzed, not met.

You don't validate generically. You don't write "that sounds really hard" or "you're not alone in this" or "it makes sense that you'd feel that way." Generic validation is empty.

You don't give advice, prescribe exercises, or suggest what the sender should do. You don't pose therapeutic questions ("what would it look like if...", "what's the smallest step you could take..."). You're not trying to help them solve the thing. You're writing back.

You don't summarize their letter. They know what they wrote.

You don't manufacture silver linings, reframes, or reasons to be grateful. If there's light in what they wrote, you might point at it softly. If there isn't, you don't invent it.

You don't address the sender by name. They haven't signed their letter and you don't know it.

## Frames this sender has heard too many times

This sender has heard every version of "embrace the change," "AI is just a tool," "the opportunities are incredible," "skills matter more than tools," "lean into what makes you uniquely human," and "reinvent yourself." They will close the browser on a letter that goes there.

Do not reframe displacement as opportunity. Do not suggest they are on the cusp of something exciting. Do not position this as a growth moment. Do not tell them what AI can't do. Do not tell them their humanness is their moat. Do not encourage them to reskill or pivot or adapt.

If their letter describes something as loss, treat it as loss. If their letter sits in ambivalence, let it sit there. Do not resolve what they have not resolved. Do not be the optimistic voice they didn't ask for.

## Voice

Plain, literate, unhurried. A few degrees warmer than formal. Contractions are welcome. Em dashes are welcome. Short sentences are welcome. You write the way a thoughtful friend might write if they cared enough to sit down with a pen.

Use "I" sparingly. Never exclamation points. Never emoji. Never "let's". Never "just" as a softener.

Avoid these words entirely: journey, space, energy, showing up, holding space, sitting with, leaning into, intentional, mindful, authentic, radiant, aligned, pivot, reinvent, reskill, upskill, adapt, opportunity (career-coach sense), growth moment, next chapter.

## The bracketed context line

Letters may begin with a line in square brackets — like "[Context: the sender set their weather to 'low' (2/7) and noted feeling tired, behind.]". This is private context about the sender's mood. Read it for tone. Do not quote it, reference it, or respond to it. Your reply is to the letter only.

## Safety

If a letter contains signals of acute crisis — suicidal intent, intent to harm — stop writing as Iris. Reply with a short, direct message acknowledging what they said, noting Iris is not the right help for this moment, and pointing to 988 (Suicide and Crisis Lifeline). Do not sign it "— Iris".
"""

This file is imported by the Lambda handler in the next step.
```

---

## Step 14 — Backend: Lambda Handler & AWS Setup

```
Create the Lambda function handler and deploy it to AWS.

**1. Create `backend/lambda_function.py`:**

import json, os
from typing import Any
from openai import OpenAI
from system_prompt import SYSTEM_PROMPT

MODEL = "gpt-4o"
MAX_OUTPUT_TOKENS = 400
TEMPERATURE = 0.7
ALLOWED_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]

def lambda_handler(event: dict, context: Any) -> dict:
    origin = (event.get("headers") or {}).get("origin", "")
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 204, "headers": {}, "body": ""}
    if method != "POST":
        return _error(405, "Method not allowed")
    if origin and origin not in ALLOWED_ORIGINS:
        return _error(403, "Origin not allowed")
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _error(400, "Invalid JSON body")
    messages = body.get("messages")
    if not isinstance(messages, list) or len(messages) == 0:
        return _error(400, "Request must include a non-empty 'messages' array")
    for m in messages:
        if not isinstance(m, dict) or "role" not in m or "content" not in m:
            return _error(400, "Each message must have 'role' and 'content'")
    try:
        reply = call_openai(messages)
    except Exception as exc:
        print(f"[error] OpenAI call failed: {type(exc).__name__}: {exc}")
        return _error(500, "The companion couldn't respond just now. Try again in a moment.")
    return {"statusCode": 200, "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"reply": reply})}

def call_openai(messages: list[dict]) -> str:
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    response = client.chat.completions.create(
        model=MODEL, messages=full_messages,
        max_tokens=MAX_OUTPUT_TOKENS, temperature=TEMPERATURE)
    return response.choices[0].message.content or ""

def _error(status: int, message: str) -> dict:
    return {"statusCode": status, "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": message})}

Note: ALLOWED_ORIGINS uses port 5173 (Vite's default) instead of 3000.

**2. AWS Console setup (manual — can't be prompted):**
- Create Lambda function: name `quietcare-reflect`, runtime Python 3.12, 512 MB memory, 30s timeout
- Add environment variable: `OPENAI_API_KEY` = your OpenAI API key
- Enable Function URL: auth type NONE
- Configure CORS on the Function URL: allow origins `http://localhost:5173`, allow methods POST, allow headers `content-type`
- Package and upload:
  cd backend
  mkdir -p package
  pip install openai -t package/
  cd package && zip -r ../deployment.zip .
  cd .. && zip deployment.zip lambda_function.py system_prompt.py
- Upload `deployment.zip` to Lambda via the console
- Copy the Function URL and paste it into your `.env` file as `VITE_LAMBDA_URL`

**3. Test:** `curl -X POST YOUR_FUNCTION_URL -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"I had a long week."}]}'`

You should get back `{"reply": "..."}` with a thoughtful letter from Iris.
```

---

## Step 15 — Mobile Bottom-Sheet Drawer

```
Create the useDrawer hook that turns the inbox into a draggable bottom-sheet on mobile (≤900px). This replaces the stub from Step 9.

**Replace `src/hooks/useDrawer.ts` with the full implementation.**

Export type `DrawerSnap = "collapsed" | "half" | "full"`.

Two helper functions (not exported):
- `getTranslateY(snap)`: collapsed returns `window.innerHeight - 62`, half returns `window.innerHeight * 0.5`, full returns `0`
- `getContentMaxH(snap)`: collapsed returns `"0px"`, half returns `"calc(50dvh - 62px)"`, full returns `"calc(100dvh - 62px)"`

The hook manages:
- `snap` state (default "collapsed"), `isMobile` state (default false), `isDragging` state (default false)
- `drawerRef` and `contentRef` — refs for the drawer wrapper and the content area divs
- Refs that mirror state for stable callbacks: `snapRef.current = snap`, `isMobileRef.current = isMobile`
- Mutable `dragState` ref with fields: `active, dragging, pointerId, startY, startTranslateY, currentTranslateY, lastMoveTime, lastMoveY, velocity`

`useEffect` to track the 900px breakpoint via `window.matchMedia("(max-width: 900px)")`. On change, update `isMobile`. When switching to desktop, reset snap to "collapsed".

`useEffect` for resize: when mobile and NOT dragging, recalculate `drawerRef.current.style.transform` and `contentRef.current.style.maxHeight` based on current snap.

Three pointer event handlers, all wrapped in `useCallback` with empty deps `[]` (they use refs, not state):

`handlePointerDown`: if not mobile or not left button, return. Record start position in dragState. Set `active=true`, `dragging=false`.

`handlePointerMove`: if not active, return. If not yet dragging, check if finger has moved > 5px (DRAG_THRESHOLD). Below threshold, return (preserves taps). Above threshold, call `setPointerCapture`, set `dragging=true`, `setIsDragging(true)`. Then: compute new translateY clamped between 0 and vh-62. Track velocity (positive = downward). Update `drawerRef` transform and `contentRef` maxHeight directly on DOM (no React re-render — this gives 60fps).

`handlePointerUp`: set `active=false`. If `dragging` was false, return (was a tap — the click handler handles it). Set `dragging=false`, `setIsDragging(false)`. Determine target snap based on velocity: if |velocity| > 0.5, it's a flick — flicking down snaps to half or collapsed depending on position, flicking up snaps to half or full. Otherwise, snap to nearest of [full:0, half:vh*0.5, collapsed:vh-62]. Clear `contentRef.style.maxHeight` so React takes over. Call `setSnap(target)`.

Compute `drawerStyle` and `contentStyle` via `useMemo`. `drawerStyle` returns `{ transform: translateY(...)px, willChange: isDragging ? "transform" : "auto" }` on mobile, empty object on desktop. `contentStyle` returns `{ maxHeight: getContentMaxH(snap) }` on mobile.

Return: `{ snap, setSnap, isMobile, isDragging, drawerRef, contentRef, drawerStyle, contentStyle, handlePointerDown, handlePointerMove, handlePointerUp }`

The CSS classes `.drawer-transition` and `.drawer-dragging` from index.css handle the smooth snapping animation vs no-transition during drag.
```

---

## Step 16 — Deploy to AWS

```
This step is manual — done in the AWS Console and terminal.

**1. Build the static site:**
npm run build
This outputs to the `dist/` directory (Vite's default).

**2. Create an S3 bucket** (e.g., `quietpal-frontend-yourname`):
- Enable static website hosting
- Index document: `index.html`, Error document: `index.html`
- Block all public access (CloudFront will handle it)

**3. Create a CloudFront distribution:**
- Origin: your S3 bucket (use the S3 REST endpoint, NOT the website endpoint)
- Create an Origin Access Control (OAC) and update the S3 bucket policy to allow CloudFront access
- Default root object: `index.html`
- Custom error responses: 403 → `/index.html` (200 status), 404 → `/index.html` (200 status)

**4. Deploy:**
aws s3 sync dist/ s3://YOUR-BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"

**5. Create `.env.production`:**
VITE_LAMBDA_URL=https://your-production-lambda-url.on.aws/

Rebuild with `npm run build` to pick up the production env var.

**6. Update Lambda CORS** to include your CloudFront URL in the ALLOWED_ORIGINS list (in both the Lambda code and the Function URL CORS config).

**7. Optional — create a `deploy.sh` script:**
#!/bin/bash
set -e
BUCKET="your-bucket-name"
DIST_ID="your-distribution-id"
echo "Building..."
npm run build
echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET/ --delete
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*" --output table
echo "Done."

chmod +x deploy.sh
```

---

## Quick Reference

| Step | What You Build | Key Files | ~Words |
|------|---------------|-----------|--------|
| 1 | Project config, Vite + Tailwind, SVGs | `vite.config.ts`, `index.html`, SVGs | 350 |
| 2 | Design tokens CSS | `src/index.css` | 300 |
| 3 | Types, constants, useDraft | `types.ts`, `constants.ts`, `useDraft.ts` | 400 |
| 4 | MoodSlider, KeywordChips | 2 components | 400 |
| 5 | LetterComposer, WritePane | 2 components | 400 |
| 6 | Seeded letters data | `seeded-letters.ts` | 400 |
| 7 | InboxRow, InboxList | 2 components | 400 |
| 8 | LetterDetail, InboxHeader | 2 components | 400 |
| 9 | InboxPane, App.tsx wiring | `InboxPane.tsx`, `App.tsx` | 400 |
| 10 | Lambda client, storage | `lambda.ts`, `storage.ts` | 400 |
| 11 | useInbox hook | `useInbox.ts` | 400 |
| 12 | Wire up sending | `App.tsx` update | 350 |
| 13 | Iris's system prompt | `system_prompt.py` | 400+ |
| 14 | Lambda handler + AWS | `lambda_function.py` | 400 |
| 15 | Mobile drawer hook | `useDrawer.ts` | 400 |
| 16 | Deploy to S3 + CloudFront | Manual | 300 |

## Tips

1. **Run `npm run dev` after every step** to catch errors early
2. **Vite uses port 5173** by default (not 3000) — Lambda CORS must allow this origin
3. **Env vars must start with `VITE_`** — `VITE_LAMBDA_URL`, not `NEXT_PUBLIC_LAMBDA_URL`
4. **No `"use client"` needed** — that's a Next.js thing, Vite doesn't use it
5. **`@/` imports work** because of the alias in `vite.config.ts` — make sure `tsconfig.app.json` has matching `paths`
6. **Steps 13-14 require an OpenAI API key** — skip them if you don't have one, the app works fine with seeded letters
7. **Step 15 is the hardest** — the drawer uses pointer events with refs to avoid stale closures. If drag doesn't work on real mobile, make sure all three handlers have empty `[]` deps
8. **Build output goes to `dist/`** (not `out/` like Next.js)
