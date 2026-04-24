# QuietPal

**A letter to Iris — she writes back in a few hours.**

QuietPal is a slow correspondence app for reflective writing. You write short letters about how you're feeling, and an AI pen pal named Iris reads them and replies thoughtfully — not instantly, but after a few hours. No live chat, no streaks, no dashboards. Just writing, waiting, and receiving a letter back.

## What It Looks Like

- **Left pane** — Write your letter. Pick a mood, select a few feeling keywords, and write what's on your mind.
- **Right pane** — Your inbox. Letters from Iris show up here with an unread dot when they arrive.
- **Mobile** — The inbox lives in a collapsible drawer at the bottom. Tap or drag to expand.

The visual style is neo-brutalist: sharp corners, thick black borders, hard-offset shadows, and bold color blocks. No rounded corners, no gradients, no blur.

## Tech Stack

- **Next.js 16** with React 19 and TypeScript
- **Tailwind CSS 4** — custom theme with design tokens
- **AWS Lambda** (Python) — processes letters and generates replies via OpenAI
- **AWS S3 + CloudFront** — hosts the static frontend
- **Fonts** — Space Grotesk + Space Mono from Google Fonts

## Getting Started

```bash
# install dependencies
npm install

# copy the env file and add your Lambda URL
cp .env.example .env.local

# start the dev server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_LAMBDA_URL` | Your AWS Lambda function URL (handles letter processing) |

The OpenAI API key lives on the backend (Lambda), never in the frontend.

## Project Structure

```
app/
├── components/        # UI components
│   ├── WritePane      # Mood slider, keyword chips, letter composer
│   ├── InboxPane      # Inbox drawer with list + detail views
│   ├── InboxHeader    # Collapsible header with drag handle (mobile)
│   ├── InboxList      # Letter rows with unread indicators
│   ├── LetterDetail   # Full letter view with Iris's reply
│   ├── MoodSlider     # 7-point mood scale (heavy → bright)
│   └── KeywordChips   # Feeling selectors (anxious, grateful, tired, etc.)
├── hooks/             # Custom React hooks
│   ├── useDraft       # Letter composition state
│   ├── useInbox       # Inbox, sending, and letter management
│   └── useDrawer      # Mobile bottom-sheet drawer
├── lib/               # Utilities
│   ├── types          # TypeScript interfaces
│   ├── constants      # Mood labels, date formatters
│   ├── lambda         # API calls to Lambda
│   └── storage        # localStorage persistence
├── layout.tsx         # Root layout with fonts
├── page.tsx           # Main two-pane page
└── globals.css        # Design tokens and global styles
```

## Design

QuietPal follows a neo-brutalist design system:

- **Colors** — Yellow (`#FFD700`) for the inbox chrome, cream (`#FEF6D6`) for writing surfaces, pink (`#FF6B9D`) for interactive accents
- **Borders** — 2px solid black on everything
- **Corners** — 0px radius, always
- **Shadows** — `2px 2px 0 0 #000` (hard offset, zero blur)
- **Interactions** — Stamp-press effect on buttons (translate + shadow removal)

## Deployment

The frontend is a static export hosted on S3 behind CloudFront. The backend is a single Lambda function.

```bash
# build the static site
npm run build

# deploy (if you have deploy.sh configured)
./deploy.sh
```

## License

Private project.
