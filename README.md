# match⚽nalyst

**AI football analyst** for fans who want data-backed, TEE-verified match breakdowns before placing a bet on [Polymarket](https://polymarket.com) or [Kalshi](https://kalshi.com).

match⚽nalyst is not a sportsbook and not a Polymarket product. It researches fixtures across major leagues and competitions, runs analysis in 0G’s Trusted Execution Environment, and surfaces win/draw/away probabilities with clear reasoning. When a prediction market exists for the match, a direct link to **Polymarket** (or **Kalshi** as fallback) is attached so you can compare the model to live market prices.

**Live:** [https://match-analyst-black.vercel.app](https://match-analyst-black.vercel.app)

## What you get

- **TEE-verified AI analysis** — inference runs in an attestable 0G environment; responses are marked as TEE verified
- **Data-backed research** — team form, head-to-head, standings, weather, and match context from football APIs
- **Live match centre** — scores, goal scorers, lineups, stats, cards, and subs when the provider publishes them
- **Probability charts** — AI model vs Polymarket odds side by side (home / draw / away)
- **Per-team win rates** — home and away win % plus draw when they don’t sum to 100%
- **One-click market links** — bet CTA opens Polymarket when a market is found, otherwise Kalshi
- **Ask Analyst** — follow-up questions grounded in the current match analysis
- **Save in browser** — bookmark analyses locally (no account or server database)

## Supported competitions

Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, FIFA World Cup, and more via [football-data.org](https://www.football-data.org/) (primary) with API-Football fallback.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| AI analyst | 0G Compute / Router (`glm-5.1`) |
| Football data | football-data.org (primary), API-Football (fallback) |
| Markets | Polymarket Gamma API; Kalshi deep links |
| Weather | OpenWeatherMap (optional) |
| Storage | Browser `localStorage` only |

## Getting started

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Recommended env vars** (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `FOOTBALL_DATA_API_KEY` | Primary fixture & match data |
| `ZEROG_ROUTER_API_KEY` | AI analysis (required for live inference) |
| `ZEROG_ROUTER_MODEL` | e.g. `glm-5.1` |
| `API_FOOTBALL_KEY` | Fallback football provider |
| `OPENWEATHER_API_KEY` | Optional venue weather |

```bash
pnpm check   # lint + typecheck
pnpm build
```

## Deploy (Vercel)

1. Import the repo in [Vercel](https://vercel.com)
2. Add the env vars above (at minimum `FOOTBALL_DATA_API_KEY` and `ZEROG_ROUTER_API_KEY`)
3. Deploy — no database or Redis required

## Architecture

See [architecture.md](./architecture.md) for data flows, API routes, and integration details.

## Disclaimer

match⚽nalyst provides **research and analysis only**. It is not financial, betting, or investment advice. Prediction-market links are for convenience and informational context. Always gamble responsibly and within your jurisdiction’s rules.

## License

MIT