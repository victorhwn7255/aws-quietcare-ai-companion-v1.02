# Handoff: QuietCare — Slock Neo-Brutalist Build

## Overview

QuietCare is a private correspondence app for mental-health journaling. A user (Mara) writes short letters to an AI correspondent named **Wren**. Wren reads each letter and writes back a few hours later — deliberately slowly. The product competes on *restraint*: no live chat, no streaks, no dashboards, no advice. Just writing, waiting, and receiving a thoughtful reply.

The visual system is a **neo-brutalist reskin inspired by Slock.ai** — loud yellow chrome, 2px black borders everywhere, zero-radius corners, hard-offset shadows, and a multi-accent palette (pink / lavender / salmon / peach).

## About the Design Files

The HTML files in this bundle are **design references**, not production code. They are prototypes showing the intended look, layout, and behavior. Your task is to **recreate the design in the target codebase's environment** (React, Next.js, Vue, SwiftUI, native, etc.) using its existing patterns, component library, and state management.

If no environment exists yet, choose the framework that best fits the project (React + Vite + TypeScript is a reasonable default for a web MVP). Do **not** ship the HTML as-is.

## Fidelity

**High-fidelity (hifi).** All colors, typography, spacing, borders, shadows, and interactions are final. Recreate pixel-perfectly using the target codebase's conventions. The distinctive visual traits (2px black borders on every surface, 0px border-radius universally, hard-offset `2px 2px 0 0 #000` shadows, and the yellow/cream color relationship) are non-negotiable — they define the product's identity.

---

## Screens / Views

The design is a single two-pane layout:

```
┌──────────────────────────────┬─────────────────────────┐
│        LEFT: WRITE           │     RIGHT: INBOX        │
│        flex: 1               │     width: 520px        │
│                              │                         │
│  ✎  A letter to Wren         │  ✉  INBOX · 7 · 1 new   │
│  ──────────────              │  ──────────────         │
│                              │                         │
│  HOW'S TODAY                 │  ● Wren      mon 9:14am │
│  [ slider 1–7 ]              │    I've been sitting... │
│  "off"  3/7                  │                         │
│                              │    Wren      sun apr 19 │
│  KEYWORDS                    │    You cleaned the...   │
│  [anxious][grateful][tired]  │                         │
│  [hopeful][restless][tender] │    Wren      thu apr 16 │
│                              │    Four days of the...  │
│  YOUR LETTER                 │                         │
│  ┌──────────────────────┐    │    ...                  │
│  │ Dear Wren,           │    │                         │
│  │                      │    │                         │
│  └──────────────────────┘    │                         │
│  0 words     [Send to Wren] │                         │
└──────────────────────────────┴─────────────────────────┘
```

Clicking an inbox row swaps the right pane to a **reading view** (date eyebrow → subject → body paragraphs → *"— Wren"* sign-off → delivery stamp). A `← Back` button returns to the list.

### View 1 — Two-pane main

**Layout**
- Full viewport height (`100vh`). CSS Grid: `grid-template-columns: 1fr 520px`.
- Left pane (`.write`): flex column, background `#FEF6D6` (cream).
- Right pane (`.inbox`): flex column, background `#FFD700` (yellow), border-left `2px solid #000`.
- Mobile (<900px): stack vertically, `grid-template-rows: 1fr auto`, inbox capped at `45vh`.

#### Left pane — Write

**Header** (`.write-head`)
- Height: content + 14px vertical padding, 24px horizontal padding.
- Background: `#FFD700`, border-bottom `2px solid #000`.
- Row: 34×34 black tile with yellow `✎` glyph (Space Mono, 18px) + title "A letter to Wren" (Space Grotesk 18px/700) + right-aligned subtitle "she writes back in a few hours" (Space Mono 11px uppercase, letter-spacing `0.08em`).

**Body** (`.write-body`) — scrollable, 28px top / 32px sides / 16px bottom padding. Sections spaced 22px apart.

**Section 1 — Mood slider** (`.mood`)
- White card, `2px solid #000`, 16px/18px/14px padding.
- Label row above: "HOW'S TODAY" (11px/700 uppercase, letter-spacing `0.08em`) + hint "drag the slider" (Space Mono 10px, `#6B6B6B`).
- 7 mono tick labels (1–7) across the top of the track.
- HTML `<input type="range" min="1" max="7" value="3">` styled brutally:
  - Track: 14px tall, `#FDF0BF` (cream-alt), `2px solid #000`.
  - Thumb: 22×22px pink (`#FF6B9D`) square with `2px solid #000` border and `2px 2px 0 0 #000` shadow. No border-radius.
- Readout below: large label (22px/700, lowercase, e.g. "off") + right-aligned "3 / 7" (Space Mono 12px, `#6B6B6B`).

**Mood label map:**
```js
const moodLabels = ["", "heavy", "low", "off", "even", "light", "warm", "bright"];
```

**Section 2 — Keywords** (`.kw-wrap`)
- White card, `2px solid #000`, 14px/16px padding. Flex wrap, 6px gap.
- Each chip (`.chip`): `2px solid #000`, 3px/10px padding, Space Grotesk 13px/700. Default bg white; selected bg `#C4B5FD` (lavender). Hover bg `#FDF0BF` (cream-alt). 50ms transition.
- 11 chips: anxious · grateful · tired · hopeful · restless · tender · proud · stuck · curious · lonely · steady.
- Clicking toggles `.is-on`. Multi-select.

**Section 3 — Letter** (`.letter`)
- White card, `2px solid #000`, shadow `2px 2px 0 0 #000`.
- Textarea: 16px/18px padding, Space Grotesk 15px/1.6 line-height, min-height 200px, max-height 360px, placeholder "Dear Wren," at `#A0A0A0`.
- Footer: `2px solid rgba(0,0,0,0.1)` top border, 8px/12px padding.
  - Left: word count (Space Mono 11px, `#6B6B6B`). Updates live.
  - Right: `Send to Wren →` button — pink (`#FF6B9D`), `2px solid #000`, `2px 2px 0 0 #000` shadow, 6px/16px padding, Space Grotesk 14px/700.
    - Hover: bg `#FF5A91`.
    - Active: `translate(2px, 2px)` + shadow gone.
    - Disabled (empty textarea): bg `#D4D4D4`, color `#767676`, no shadow.

#### Right pane — Inbox

**Header** (`.inbox-head`)
- Background `#000`, text `#FFD700`, 14px/18px padding, border-bottom `2px solid #000`.
- Row: 28×28 yellow tile with black `✉` glyph + title "INBOX" (Space Grotesk 14px/700 uppercase, letter-spacing `0.08em`) + right-aligned count "7 · 1 new" (Space Mono 11px).
- When a letter is open: a `← Back` button appears at the start of the row (yellow bg, 2px yellow border, 2px/10px padding, 12px/700). Title swaps to "Letter"; count swaps to the day-of-week ("Monday", etc.).

**Inbox list** (`.inbox-list`) — scrollable, cream bg `#FEF6D6`.

Each email row (`.email`):
- 14px/18px padding, border-bottom `2px solid #000`.
- Row 1: pink dot (8×8, 1.5px black border) only if unread · "Wren" (14px/700) · right-aligned date (Space Mono 11px).
- Snippet (`.snippet`): 13px/1.4 line-height, 2-line clamp.
- **Unread state**: bg `#FFD700`, snippet color `#000` (normal weight). Hover `#F7CC00`.
- **Read state**: bg `#FFF` (white), snippet color `#6B6B6B`. Hover `#FDF0BF`.
- Clicking marks as read (remove `.unread`, remove `.dot` element) and opens the detail view.

**Letter detail view** (`.email-detail`)
- 22px/22px/28px padding.
- Date eyebrow (`.meta`): Space Mono 11px uppercase, letter-spacing `0.06em`, color `#6B6B6B`.
- Subject (`h3`): 20px/700, line-height 1.3, 14px margin-bottom.
- Body paragraphs (`p`): 15px/1.65 line-height, 12px margin-bottom.
- Signature: italic, 700 weight, "— Wren", 18px margin-top.
- Stamp (`.stamp`): inline block, `2px solid #000`, white bg, 2px/10px padding, Space Mono 10px uppercase, letter-spacing `0.08em`. Text: "read · delivered 2–6 hrs after you sent".

**7 seeded letters** — full content embedded in `letters` object in the HTML (see `quietcare-slock-v3.html`). Subjects:
1. *About not calling him back.* (unread, Mon Apr 20)
2. *On the too-clean apartment.* (Sun Apr 19)
3. *On the email you keep rewriting.* (Thu Apr 16)
4. *On explaining it away.* (Tue Apr 14)
5. *Flowers for no one.* (Fri Apr 10)
6. *Three weeks in.* (Mon Apr 6)
7. *Your first letter.* (Sat Apr 4)

---

## Interactions & Behavior

1. **Mood slider** — `input` event updates label (1→"heavy" … 7→"bright") and numeric readout "N / 7".
2. **Keyword chips** — click toggles `.is-on`. Multi-select; no limit.
3. **Letter textarea** — `input` event recalculates word count (`.trim().split(/\s+/).length`, treat empty as 0) and enables/disables the Send button.
4. **Send to Wren** — (currently no-op; implement: POST letter + mood value + selected keywords, show confirmation, clear draft). In the real build, this kicks off the 2–6 hour delivery delay before Wren's reply appears.
5. **Email row click** — remove `.unread` + `.dot`, hide list, show detail with rendered paragraphs, scroll inbox-scroll to top, update header title/count.
6. **Back button** — hide detail, show list, restore "INBOX" title and count.
7. **Hover transitions** — 50ms background swaps only. No opacity fades. Active presses: `translate(2px, 2px)` + remove shadow.

No animations longer than 200ms. No spring/elastic easing.

---

## State Management

Minimum state needed:
```ts
interface DraftState {
  mood: 1 | 2 | 3 | 4 | 5 | 6 | 7;   // default 3
  keywords: Set<string>;              // default {"tired", "stuck"}
  body: string;                        // default ""
}

interface InboxState {
  letters: Letter[];                   // fetched from backend
  openLetterId: string | null;         // null = list view, else detail view
}

interface Letter {
  id: string;
  date: string;          // ISO
  subject: string;
  body: string[];        // paragraphs
  read: boolean;
}
```

**Data fetching**: `GET /api/inbox` for the list, `POST /api/letters` to send a draft, `PATCH /api/letters/:id/read` on open. Backend queues the AI reply with the 2–6 hour delay.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--yellow` | `#FFD700` | Sidebar/header chrome, unread rows, channel tiles |
| `--black` | `#000000` | Text, borders, inbox header bg |
| `--pink` | `#FF6B9D` | Primary CTA, slider thumb, unread dots |
| `--lavender` | `#C4B5FD` | Active keyword chips |
| `--salmon` | `#F4845F` | Accent (conversation markers) |
| `--cream` | `#FEF6D6` | Main page bg, inbox list bg |
| `--cream-alt` | `#FDF0BF` | Hover, slider track |
| `--white` | `#FFFFFF` | Cards, read rows |
| `--peach` | `#FFE5CC` | Avatar bg option |
| `--text-2` | `#6B6B6B` | Secondary text, timestamps |
| `--text-3` | `#767676` | Disabled text |
| `--border-light` | `#D4D4D4` | Disabled button bg |

### Spacing
4px base scale. Common values: 4, 6, 8, 10, 12, 14, 16, 18, 22, 24, 28, 32px.

### Typography
- **Primary**: `"Space Grotesk", system-ui, sans-serif`. Weights **400 and 700 only**. Never 500/600/800.
- **Mono**: `"Space Mono", ui-monospace, monospace`. Weights 400 and 700.
- **Scale**: 10 / 11 / 12 / 13 / 14 / 15 / 18 / 20 / 22 px.
- **Letter-spacing**: `normal` everywhere except uppercase labels (`0.08em`) and some secondary labels (`0.06em`, `0.04em`).
- **Line-heights**: 1.3 (headings), 1.4–1.5 (UI text), 1.6–1.65 (body reading).

### Border Radius
**`0px` universally.** The only exceptions in the broader Slock system are online-status dots and toggle tracks — neither appears in this design.

### Borders
- `2px solid #000000` on every interactive surface (cards, inputs, buttons, textareas, chips, slider thumb, slider track).
- Internal hairlines (letter-foot, email border-bottom in detail): `2px solid rgba(0,0,0,0.10)` or 1.5px for subtle dividers.

### Shadows
**One shadow only: `2px 2px 0 0 #000000`.** No blur. No scale. Applied to: letter card, send button, slider thumb. Pressed state = shadow disappears + `translate(2px, 2px)`.

### Motion
- Durations: 50ms (hover/active swaps).
- No easing beyond browser default — instant color swaps, no fades.
- No animations over 200ms anywhere.
- Respect `prefers-reduced-motion`: keep color state changes, drop transforms.

---

## Fonts

Load Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

Weights: **400 and 700 only** for both families.

---

## Assets

No raster images or icon libraries. All glyphs are Unicode / monospace characters:
- `✎` — letter tile
- `✉` — inbox tile
- `→` — send arrow
- `←` — back arrow

If you swap these for an icon library, use a geometric outline set (e.g. Lucide at `stroke-width: 2`). Do not use filled or rounded icons.

---

## Do's and Don'ts

### DO
- 2px solid black borders on every interactive surface.
- 0px border-radius on everything (no rounded pill buttons, cards, inputs, or chips).
- Hard-offset shadow `2px 2px 0 0 #000` — never blurred.
- Instant 50ms color swaps for hover.
- Stamp-press active state (`translate(2px, 2px)` + shadow removed).

### DON'T
- Add any border-radius to buttons, cards, chips, or inputs.
- Use `box-shadow` with blur, or any elevation system.
- Use gradients, glass-morphism, backdrop-blur, or transparency.
- Use font weights 500, 600, or 800.
- Put yellow backgrounds in the content/writing zone.
- Add opacity fades or animations longer than 200ms.

---

## Files in this bundle

- **`quietcare-slock-v3.html`** — the final approved design. Self-contained reference. All tokens, components, and interactions live here.
- **`reference/slock-design-system.md`** — the broader Slock design system guide the visual language is drawn from.
- **`reference/slock-theme.json`** — the full token set as JSON. Consume this directly if you want to generate Tailwind config, CSS custom properties, or design tokens for another tool.

The v3 HTML is canonical. The two reference files give you the wider system vocabulary in case you add new screens (settings, onboarding, crisis state, etc.) and need to extend the language consistently.

---

## Suggested implementation order

1. Set up the framework (React + Vite + TS recommended).
2. Port tokens from `slock-theme.json` into CSS custom properties or Tailwind config.
3. Wire fonts, base styles, and the two-pane grid shell.
4. Build the three left-pane sections as isolated components (`<MoodSlider>`, `<KeywordChips>`, `<LetterComposer>`).
5. Build the inbox: list view + detail view, with a single `openLetterId` state driving the swap.
6. Wire the backend: GET inbox, POST letter, PATCH read. The 2–6 hour AI reply delay is a server concern, not a client concern.
7. Mobile responsive pass (<900px stacks vertically).
8. Accessibility pass: keyboard nav for chips + slider, ARIA labels for the tiles, focus rings using the pink accent (`2px solid #FF6B9D`).
