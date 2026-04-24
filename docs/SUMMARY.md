# QuietPal — Project Summary

## What Is QuietPal?

QuietPal is a slow correspondence app for reflective writing. You write short letters about how you're feeling, and an AI pen pal named **Iris** reads them and replies thoughtfully — not instantly, but after a deliberate delay. In development, replies arrive after 30 seconds. In production, the wait is 2–6 hours.

There's no live chat, no streaks, no dashboards, no advice engine. Just writing, waiting, and receiving a letter back.

**Tagline:** *"A letter to Iris — she writes back in a few hours."*

**Target audience:** Mid-career professionals navigating uncertainty, career transitions, and the weight of daily life. Iris notices rather than explains, picks one thread rather than covering everything, and writes in a plain, literate, unhurried voice.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 16.2.4 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Fonts | Space Grotesk + Space Mono | Google Fonts |
| Backend | AWS Lambda | Python 3.12 |
| LLM | OpenAI GPT-4o | via `httpx` |
| Hosting | AWS S3 + CloudFront | Static export |
| Icons | react-icons | 5.6.0 |

---

## Architecture

### How It All Fits Together

```
Browser (Next.js static site on CloudFront)
  │
  ├── WritePane ── user writes letter ──┐
  │                                     │
  │                              POST to Lambda
  │                                     │
  │                              Lambda (Python)
  │                              ├── validates request
  │                              ├── prepends Iris's system prompt
  │                              ├── calls OpenAI GPT-4o
  │                              └── returns { reply: "..." }
  │                                     │
  └── InboxPane ── reply appears ───────┘
        after 30s (dev) / 2-6h (prod)
```

### Data Flow

1. **User composes**: sets mood (1–7 slider), selects feeling keywords, writes letter text
2. **Send**: frontend calls `handleSend()` — clears the compose pane immediately, creates a "waiting" letter in the inbox
3. **Lambda call**: letter text is sent with a context bracket (`[Context: mood="off" (3/7), keywords="anxious, tired"]`)
4. **Reply received**: Lambda returns Iris's response. It's stored on the letter but NOT shown yet — state stays "waiting"
5. **Timer fires** (30s dev / 2–6h prod): letter transitions from "waiting" to "unread". Inbox row turns yellow with a pink dot
6. **User opens letter**: full detail view with date, subject, Iris's reply paragraphs, and "— Iris" signoff. State becomes "read"
7. **Persistence**: real sent letters are saved to `localStorage` and survive browser refresh. Timers resume correctly on reload

---

## Frontend Structure

```
app/
├── page.tsx              # Root — orchestrates useDraft + useInbox hooks
├── layout.tsx            # Fonts (Space Grotesk, Space Mono), metadata
├── globals.css           # Design tokens, global styles, slider CSS
│
├── components/
│   ├── WritePane.tsx     # Left pane container (header + mood + keywords + composer)
│   ├── MoodSlider.tsx    # 1–7 range input with mood labels
│   ├── KeywordChips.tsx  # 15 feeling keyword toggles
│   ├── LetterComposer.tsx# Textarea + word count + send button
│   ├── InboxPane.tsx     # Right pane container + mobile drawer logic
│   ├── InboxHeader.tsx   # Dual-mode header (list vs detail), drag handle
│   ├── InboxList.tsx     # Scrollable letter list
│   ├── InboxRow.tsx      # Single letter row (waiting/unread/read/failed states)
│   └── LetterDetail.tsx  # Full letter view with reply + signoff
│
├── hooks/
│   ├── useDraft.ts       # Composition state (mood, keywords, body)
│   ├── useInbox.ts       # Inbox, Lambda calls, timers, localStorage
│   └── useDrawer.ts      # Mobile bottom-sheet drawer + drag gesture
│
└── lib/
    ├── types.ts          # TypeScript interfaces (Letter, DraftState)
    ├── constants.ts      # MOOD_LABELS, date formatters
    ├── lambda.ts         # Lambda fetch wrapper + context builder
    ├── storage.ts        # localStorage read/write with validation
    └── seeded-letters.ts # 7 pre-populated example letters from Iris
```

---

## Components

### WritePane
Container for the compose experience. Yellow header with logo, "QuietPal" title, and status dot. Scrollable body with three sections: mood slider, keyword chips, and letter composer.

### MoodSlider
HTML range input (1–7) with neo-brutalist styling. Pink square thumb, cream track, tick labels. Labels map to words: heavy, low, off, even, light, warm, bright. Full ARIA support with `aria-valuenow` and `aria-valuetext`.

### KeywordChips
15 feeling keywords as toggle buttons: anxious, grateful, tired, hopeful, restless, tender, proud, stuck, curious, lonely, steady, overwhelmed, adrift, behind, conflicted. Multi-select. Unselected = white, selected = lavender (`#C4B5FD`). Uses `aria-pressed`.

### LetterComposer
Textarea (placeholder "Dear Iris,"), live word count, and send button. Send button is pink with a stamp-press effect on click (translates down-right, shadow disappears). Disabled when empty or during send. Shows "Sending..." while Lambda call is in flight.

### InboxPane
Right pane on desktop, bottom-sheet drawer on mobile. Manages drawer state via `useDrawer` hook. Auto-expands to full screen when opening a letter, restores previous position on close.

### InboxHeader
Two modes. **List mode**: inbox icon, "Inbox" title, count pill ("7 letters", "2 new"). **Detail mode**: back button, "Letter" title, day name. On mobile, the header is tappable (toggle collapsed/half) and draggable (expand/collapse gesture). Has a small drag handle bar and full ARIA support.

### InboxList
Simple scrollable wrapper with `aria-live="polite"` so screen readers announce new letters. Uses `overscroll-behavior-y: contain` to prevent scroll chaining on mobile.

### InboxRow
State-dependent letter row:
- **Waiting**: cream-alt bg, italic "Iris is reading", shows user's letter as snippet
- **Failed**: cream-alt bg, error message ("Iris couldn't respond"), disabled
- **Unread**: yellow bg, pink dot, Iris's reply as snippet
- **Read**: white bg, gray text, reply snippet

### LetterDetail
Full letter view. Shows date eyebrow, subject heading, body paragraphs, "— Iris" signoff in a footer, and a delivery stamp ("read · delivered 2–6 hrs after you sent"). Waiting state shows the user's own letter with a placeholder box.

---

## Hooks

### useDraft
Pure composition state. Manages `mood` (number 1–7), `keywords` (Set of strings), and `body` (text). Computes `wordCount` and `canSend`. Provides `reset()` for post-send cleanup. No side effects.

### useInbox
The workhorse hook. Manages the full letter lifecycle:
- **Sending**: calls Lambda, creates waiting entry, schedules reveal timer
- **Timer logic**: 30s delay, then "waiting" → "unread"
- **Persistence**: loads/saves real letters from localStorage on every mutation
- **Resume on reload**: handles 4 cases — expired timers (reveal immediately), running timers (reschedule remaining), no reply (mark failed), already read/unread (render as-is)
- **Reply parsing**: strips duplicate "— Iris" signoffs, splits into paragraphs

### useDrawer
Mobile bottom-sheet drawer. Three snap positions: collapsed (62px header), half (50dvh), full (100dvh). Uses pointer events with a 5px drag threshold to distinguish taps from drags. Velocity-based snapping for natural flick gestures. Direct DOM manipulation during drag for 60fps, CSS transitions for snap animations. All callbacks use refs to avoid stale closures.

---

## State Management

No Redux, Context, or Zustand. The app uses **plain React hooks with props-based data flow**:

1. `page.tsx` calls `useDraft()` and `useInbox()` at the root
2. All state is passed as props to `WritePane` and `InboxPane`
3. `handleSend()` orchestrates the draft → send → reset flow
4. Hooks are independent — no circular imports, clean separation
5. `localStorage` persistence is handled entirely within `useInbox`

---

## Design System

QuietPal uses a **neo-brutalist** visual language inspired by Slock.ai.

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| yellow | `#FFD700` | Inbox bg, headers, unread rows |
| black | `#000000` | Text, borders, shadows |
| white | `#FFFFFF` | Cards, reading surfaces, inputs |
| pink | `#FF6B9D` | Buttons, focus rings, unread dots, selected states |
| lavender | `#C4B5FD` | Selected keyword chips |
| cream | `#FEF6D6` | Write pane bg, card backgrounds |
| cream-alt | `#FDF0BF` | Hover states, waiting row bg |
| success | `#2DC653` | "New" count badge |
| text-2 | `#6B6B6B` | Secondary text (dates, metadata) |
| border-light | `#D4D4D4` | Light separators |

### Typography
- **Space Grotesk** (sans-serif): all UI text. Weights 400 and 700 only.
- **Space Mono** (monospace): timestamps, dates, delivery stamps, count pills.
- Base font size: 14px. Scale: 12 / 14 / 16 / 18 / 24 / 30px.

### Visual Traits
- **Borders**: 2px solid black on every interactive surface
- **Corners**: 0px radius universally — no rounded corners anywhere
- **Shadows**: `2px 2px 0px 0px #000` — hard offset, zero blur
- **Hover**: instant 50ms color swap, no fade
- **Press**: translate(2px, 2px) + shadow removed ("stamp-press" effect)
- **No gradients, no blur, no transparency**

---

## Mobile Responsiveness

**Breakpoint: 900px**

| Viewport | Layout |
|----------|--------|
| > 900px (desktop) | Two-pane grid: write (1fr) + inbox (520px) side by side |
| ≤ 900px (mobile) | Single column. Inbox becomes a bottom-sheet drawer at the bottom |

### Mobile Drawer
- **Collapsed** (default): 62px — only the inbox header visible
- **Half**: 50dvh — tap header or drag up to reach this
- **Full**: 100dvh — drag further up, or auto-expands when opening a letter

### Additional Mobile Handling
- `env(safe-area-inset-*)` on body for notch support
- Textarea gets `min-height: 120px` below 600px
- `overscroll-behavior: none` prevents page bounce
- `touch-action: none` on drawer header prevents browser scroll conflicts

---

## Accessibility

- **Focus rings**: 2px pink outline on all interactive elements (keyboard only, via `:focus-visible`)
- **Slider**: full ARIA — `aria-label`, `aria-valuenow`, `aria-valuetext` (announces "off" not "3")
- **Chips**: `aria-pressed="true"/"false"` on each toggle
- **Inbox rows**: semantic `<button>` elements with descriptive `aria-label` per state
- **Drawer header**: `aria-expanded`, `aria-label="Toggle inbox"`, keyboard Enter/Space support
- **Letter detail**: semantic HTML — `<article>`, `<h2>`, `<footer>`
- **Live region**: `aria-live="polite"` on inbox list for new letter announcements
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` suppresses all transitions and transforms

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Lambda timeout (45s) | AbortController fires, letter marked "failed" |
| Non-200 Lambda response | Letter marked "failed" |
| Malformed reply (not a string, empty) | Runtime validation catches it, letter marked "failed" |
| Invalid dates | Formatters return "unknown" / "unknown date" |
| localStorage write failure | Try/catch, console.warn, app continues |
| Rapid double-send | `sendingRef` guard blocks concurrent sends |
| Failed letter display | Gray italic message: "Iris couldn't respond — try again later" |

---

## Backend

### Lambda Function (`quietcare-reflect`)
- **Runtime**: Python 3.12
- **Handler**: `lambda_function.lambda_handler`
- **Memory**: 512 MB
- **Timeout**: 30 seconds
- **Auth**: None (CORS-gated)
- **Environment**: `OPENAI_API_KEY`

### Request/Response
```
POST → { messages: [{ role: "user", content: "..." }] }
← 200 { reply: "Dear friend, ..." }
```

### Iris's Voice (System Prompt)
Iris is defined via a system prompt in `system_prompt.py`. She writes like a thoughtful pen pal — noticing rather than explaining, picking one thread rather than covering everything. She never gives advice, never uses therapy language, and maintains a plain, literate, unhurried voice.

### CORS
Three allowed origins:
- `http://localhost:3000` (dev)
- `http://localhost:3001` (alt dev)
- `https://dbwomll77c53u.cloudfront.net` (production)

---

## Deployment

### Frontend
- **Build**: `npm run build` → static export to `out/`
- **Host**: S3 bucket → CloudFront CDN
- **Update**: `./deploy.sh` (builds, syncs to S3, invalidates CloudFront cache)
- **URL**: `https://dbwomll77c53u.cloudfront.net`

### Backend
- **Deploy**: manual zip upload via AWS Console
- **Package**: `lambda_function.py` + `system_prompt.py` + `httpx` dependency in a zip
- **Update**: edit code in Console or re-upload zip

---

## Development Phases

| Phase | Description |
|-------|-------------|
| 0 | Scaffold Next.js 16, TypeScript, Tailwind 4 |
| 1 | Design tokens, two-pane layout shell, fonts |
| 2 | Write pane — mood slider, keyword chips, letter composer |
| 3 | Inbox pane — seeded letters, list/detail views |
| 4 | Lambda integration, 30-second delay, waiting/failed states |
| 4.5 | Iris's voice, context payload with mood + keywords |
| 5 | localStorage persistence, timer resumption |
| 6 | Mobile responsive, accessibility, final polish |
| 6.5 | Pre-deployment audit (21 findings) |
| 6.6 | Applied 8 approved audit fixes (C1, H1–H4, M1, M2, M4) |
| 7 | Static export, S3 + CloudFront deployment |
| 7.5 | Backend relocation into project repo |
| Post | Mobile drawer bugs, double-signoff fix, seeded letter state fix |

---

## Key Design Decisions

1. **No state library** — props-based drilling from `page.tsx` keeps data flow predictable and debuggable
2. **useInbox owns everything** — Lambda calls, timers, persistence, and state transitions all in one hook
3. **Reply stored immediately, revealed later** — the reply is fetched right away but held in "waiting" state. The timer just flips visibility. This ensures the reply survives a tab close
4. **Seeded letters never persisted** — always fresh on every page load, never mixed with real user data
5. **30s dev delay** — fast enough for development iteration, long enough to test the waiting UX
6. **UUIDs for real letters** — collision-safe IDs via `crypto.randomUUID()`
7. **translateY drawer** — GPU-accelerated positioning for smooth 60fps drag on mobile
8. **Static export** — no server needed. The entire frontend is a folder of HTML/CSS/JS served from S3
9. **CORS at both layers** — Lambda checks origin at the application level AND via Function URL CORS config
10. **No automatic retry on failure** — keeps complexity low. User can close and reopen to try again

---

## Project Stats

| Metric | Count |
|--------|-------|
| React components | 9 |
| Custom hooks | 3 |
| Lib modules | 5 |
| Seeded letters | 7 |
| Feeling keywords | 15 |
| Mood levels | 7 |
| Color tokens | 15+ |
| Development phases | 10+ |
| Audit findings fixed | 8 of 21 |
| Total app/ source lines | ~1,250 |
