# Daily Affirmation (Web)

A browser-based version of Daily Affirmation — write about your day, watch the postcard shuffle, and flip to your personalized affirmation. No install required.

## Quick start

```bash
cd web
npm install --legacy-peer-deps
npm run dev
```

Open the URL shown in the terminal (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview   # optional: serve the dist/ folder locally
```

## First run

1. Open **Settings** and choose **OpenAI** or **Anthropic**.
2. Paste your API key and tap **Save API key** (stored in this browser’s `localStorage`).
3. On **Today**, write about your day and tap **Submit**.

## Features

- **Today** — centered flip card, thought input, postcard shuffle (~3s minimum), 3D flip to affirmation
- **History** — past days grouped by month; view, edit, regenerate
- **Settings** — provider, API key, privacy note
- **Storage** — thoughts and affirmations in `localStorage` (one entry per calendar day)

## CORS and API keys

This MVP calls OpenAI/Anthropic **directly from the browser** with your API key. Implications:

| Provider | Browser access |
|----------|----------------|
| **Anthropic** | Supported with header `anthropic-dangerous-direct-browser-access: true` (included). Keys must be allowed for client-side use per Anthropic’s policy. |
| **OpenAI** | Often blocked by CORS from a static site. **`npm run dev`** routes requests through Vite’s dev proxy (`/api/openai/...`) to avoid CORS locally. |

### If generation fails with a network / CORS error

1. **Local dev:** use `npm run dev` (proxy enabled automatically in development).
2. **Production / static hosting:** deploy behind a small reverse proxy, or run a minimal server that forwards `/api/openai` and `/api/anthropic` to the real APIs (your key stays in the browser; the proxy only avoids CORS).
3. **Alternative:** use Anthropic from the browser when their dashboard allows client-side keys.

Never commit API keys. Keys live only in your browser’s `localStorage`.

## Project layout

```
web/
├── src/
│   ├── components/     # Flip card, shuffle deck, background
│   ├── hooks/          # Today screen state
│   ├── prompts/        # Affirmation system prompt (from iOS)
│   ├── services/       # OpenAI / Anthropic clients
│   ├── storage/        # localStorage (entries + settings)
│   ├── theme/          # Colors from AppTheme.swift
│   └── views/          # Today, History, Settings, Entry detail
├── public/
└── vite.config.ts      # Dev proxy for API CORS
```

## Tech stack

- Vite + React + TypeScript
- No backend required for MVP
