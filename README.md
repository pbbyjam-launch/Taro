# Daily Affirmation

Pair your daily thoughts with a personalized AI-generated affirmation — in the browser, no download required.

## Web app (recommended)

```bash
cd web
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints).

**Live site (GitHub Pages):** after deploy, https://pbbyjam-launch.github.io/Taro/

1. Open **Settings** → choose **OpenAI** or **Anthropic** → paste your API key → **Save API key**.
2. On **Today**, write about your day → **Submit** → flip the card for your affirmation.

See [web/README.md](web/README.md) for build commands, CORS notes, and project layout.

```bash
cd web && npm run build   # production static build → web/dist/
```

## iOS app (optional / legacy)

The original SwiftUI app remains in `DailyAffirmation/` for iPhone users who prefer a native experience.

### Requirements

- macOS with **Xcode 15+**
- iOS **17+** device or simulator
- OpenAI or Anthropic API key

### Open in Xcode

```bash
open DailyAffirmation.xcodeproj
```

1. Select the **DailyAffirmation** scheme and an iPhone simulator (or your device).
2. Set your **Development Team** under Signing & Capabilities.
3. Build and run (⌘R).

API keys on iOS are stored in the Keychain; on web they are stored in `localStorage` in your browser only.

## Features (web + iOS)

- **Today** — one thought per calendar day; generate or regenerate affirmations with a flip-card UI
- **History** — browse past entries by month; edit thoughts; regenerate affirmations
- **Settings** — AI provider and API key; privacy note (web: no server; iOS: optional daily reminder)

## Privacy

- **Web:** thoughts and affirmations stay in this browser (`localStorage`). Generating sends your text to the AI provider you choose, using your API key.
- **iOS:** on-device SwiftData; API keys in Keychain; optional local daily reminder.

## Repository layout

```
DailyAffirmation/          # iOS app (SwiftUI)
web/                       # Web app (Vite + React + TypeScript)
README.md
TESTFLIGHT.md              # iOS TestFlight notes
```

## TestFlight (iOS only)

See [TESTFLIGHT.md](TESTFLIGHT.md) for App Store Connect and archive steps.
