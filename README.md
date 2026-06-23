# Match Analyst

**Polymarket Football AI Analyst** — an intelligent AI agent specialized in football (soccer) match analysis.

Users ask about upcoming matches across major leagues and competitions. The agent researches team form, head-to-head records, injuries, motivation, weather, and referee context, then outputs clear probability estimates with detailed reasoning. When available, Polymarket prices are shown for **market context only** — not as betting advice.

## Core Features

- Natural-language or structured match input (Premier League, La Liga, Champions League, World Cup qualifiers, etc.)
- Data-driven analysis from API-Football (form, H2H, injuries, standings, lineups)
- Polymarket-style probability output: `Home Win: 58% | Draw: 25% | Away Win: 17%`
- Side-by-side comparison with Polymarket odds when a market exists
- User memory for favorite teams and leagues (0G Storage)
- Save predictions and AI-backed market research notes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript |
| AI Analyst | 0G Compute Network |
| Memory / Storage | 0G Storage |
| Football Data | API-Football (api-sports.io) |
| Market Context | Polymarket Gamma API |
| Weather | OpenWeatherMap |

## UI Sections

1. **Match Input** — fixture search, league filter, Polymarket market badge
2. **AI Analysis** — conversational, data-driven match breakdown
3. **Probability Breakdown** — model vs Polymarket comparison (primary market display)
4. **Trading Insight** — divergence summary, confidence caveats, save CTA

## Documentation

See [architecture.md](./architecture.md) for system design, data flows, API contracts, and deployment notes.

## Disclaimer

This product provides **research and analysis only**. It is not financial, betting, or investment advice. Polymarket prices are shown for informational context.

## License

MIT