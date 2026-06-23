# Match Analyst

**Polymarket Football AI Analyst** — an intelligent AI agent specialized in football (soccer) match analysis.

Users ask about upcoming matches across major leagues and competitions. The agent researches team form, head-to-head records, injuries, motivation, weather, and referee context, then outputs clear probability estimates with detailed reasoning. When available, Polymarket prices are shown for **market context only** — not as betting advice.

## Core Features

- Natural-language or structured match input (Premier League, La Liga, Champions League, World Cup qualifiers, etc.)
- Data-driven analysis from API-Football (form, H2H, injuries, standings, lineups)
- Polymarket-style probability output: `Home Win: 58% | Draw: 25% | Away Win: 17%`
- Side-by-side comparison with Polymarket odds when a market exists
- Interactive workspace with tabbed sections and live analysis progress
- Ask Analyst — conversational follow-ups grounded in the current analysis
- Favorite teams and saved research stored in your browser (no server database)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript |
| AI Analyst | 0G Compute Network |
| User data | Browser localStorage |
| Football Data | API-Football (api-sports.io) |
| Market Context | Polymarket Gamma API |
| Weather | OpenWeatherMap |

## UI Sections

1. **Match Input** — fixture search, league filter, Polymarket market badge
2. **AI Analysis** — conversational, data-driven match breakdown
3. **Probability Breakdown** — model vs Polymarket comparison (primary market display)
4. **Trading Insight** — divergence summary, confidence caveats, save CTA
5. **Ask Analyst** — interactive follow-up Q&A on the current match

## Getting Started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Without API keys the app runs in **demo mode** with sample fixtures and analysis. Add `API_FOOTBALL_KEY` and `ZEROG_PRIVATE_KEY` for live data and 0G Compute inference.

## Production deploy (Vercel)

Live app: [https://match-analyst-black.vercel.app](https://match-analyst-black.vercel.app)

1. Import the GitHub repo in [Vercel](https://vercel.com)
2. Set environment variables from `.env.example`
3. Deploy — no database or Redis required

```bash
pnpm check   # lint + typecheck
pnpm build
```

Saved analyses and favorite teams persist in the user's browser. API routes handle football data, Polymarket lookup, analysis, and follow-up chat only.

## Documentation

See [architecture.md](./architecture.md) for system design, data flows, API contracts, and deployment notes.

## Disclaimer

This product provides **research and analysis only**. It is not financial, betting, or investment advice. Polymarket prices are shown for informational context.

## License

MIT