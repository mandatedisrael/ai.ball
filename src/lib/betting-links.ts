import { WORLD_CUP_LEAGUE_ID } from "@/lib/leagues";
import type { FixtureSummary } from "@/types/fixture";
import type { PolymarketMarketContext } from "@/types/polymarket";

export type BettingVenue = "polymarket" | "kalshi";

export interface BettingLink {
  venue: BettingVenue;
  url: string;
  label: string;
  subtitle?: string;
}

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
] as const;

/** FIFA-style codes used in Kalshi World Cup market slugs (lowercase). */
const NATIONAL_TEAM_CODES: Record<string, string> = {
  algeria: "dza",
  argentina: "arg",
  australia: "aus",
  austria: "aut",
  belgium: "bel",
  brazil: "bra",
  cameroon: "cmr",
  canada: "can",
  chile: "chi",
  colombia: "col",
  "costa rica": "crc",
  croatia: "cro",
  czechia: "cze",
  "czech republic": "cze",
  denmark: "den",
  ecuador: "ecu",
  egypt: "egy",
  england: "eng",
  france: "fra",
  germany: "ger",
  ghana: "gha",
  greece: "gre",
  honduras: "hon",
  iran: "irn",
  italy: "ita",
  ivory: "civ",
  "cote d'ivoire": "civ",
  japan: "jpn",
  jordan: "jor",
  mexico: "mex",
  morocco: "mar",
  netherlands: "ned",
  "new zealand": "nzl",
  nigeria: "nga",
  norway: "nor",
  paraguay: "par",
  peru: "per",
  poland: "pol",
  portugal: "por",
  qatar: "qat",
  romania: "rou",
  "saudi arabia": "ksa",
  scotland: "sco",
  senegal: "sen",
  serbia: "srb",
  "south africa": "rsa",
  "south korea": "kor",
  korea: "kor",
  spain: "esp",
  sweden: "swe",
  switzerland: "sui",
  tunisia: "tun",
  turkey: "tur",
  türkiye: "tur",
  ukraine: "ukr",
  uruguay: "uru",
  usa: "usa",
  "united states": "usa",
  venezuela: "ven",
  wales: "wal",
};

function normalizeTeamName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function teamToKalshiCode(name: string): string | null {
  const normalized = normalizeTeamName(name);
  if (NATIONAL_TEAM_CODES[normalized]) {
    return NATIONAL_TEAM_CODES[normalized];
  }

  const words = normalized.split(" ").filter(Boolean);
  if (words.length === 1) {
    const word = words[0];
    if (word.length >= 3) return word.slice(0, 3);
    return null;
  }

  const acronym = words.map((word) => word[0]).join("");
  if (acronym.length >= 3) return acronym.slice(0, 3);
  return null;
}

function formatKalshiWorldCupDate(dateIso: string): string | null {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return null;

  const year = String(date.getUTCFullYear()).slice(-2);
  const month = MONTHS[date.getUTCMonth()];
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function buildKalshiWorldCupMarketUrl(fixture: FixtureSummary): string | null {
  const homeCode = teamToKalshiCode(fixture.homeTeam.name);
  const awayCode = teamToKalshiCode(fixture.awayTeam.name);
  const datePart = formatKalshiWorldCupDate(fixture.date);

  if (!homeCode || !awayCode || !datePart) return null;

  const ticker = `kxwcgame-${datePart}${homeCode}${awayCode}`;
  return `https://kalshi.com/markets/kxwcgame/world-cup-game/${ticker}`;
}

function buildKalshiSearchUrl(fixture: FixtureSummary): string {
  const query = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  return `https://kalshi.com/search?q=${encodeURIComponent(query)}`;
}

function buildKalshiUrl(fixture: FixtureSummary): BettingLink {
  if (fixture.league.id === WORLD_CUP_LEAGUE_ID) {
    const marketUrl = buildKalshiWorldCupMarketUrl(fixture);
    if (marketUrl) {
      return {
        venue: "kalshi",
        url: marketUrl,
        label: "Bet on Kalshi",
        subtitle: "World Cup market",
      };
    }

    return {
      venue: "kalshi",
      url: "https://kalshi.com/category/sports/soccer/fifa-world-cup",
      label: "Bet on Kalshi",
      subtitle: "FIFA World Cup",
    };
  }

  return {
    venue: "kalshi",
    url: buildKalshiSearchUrl(fixture),
    label: "Bet on Kalshi",
    subtitle: fixture.league.name,
  };
}

function polymarketUrl(
  market?: PolymarketMarketContext | null,
  resultMarket?: PolymarketMarketContext | null,
): string | undefined {
  if (resultMarket?.found && resultMarket.url) return resultMarket.url;
  if (market?.found && market.url) return market.url;
  return undefined;
}

export function resolveBettingLink(
  fixture: FixtureSummary,
  market?: PolymarketMarketContext | null,
  resultMarket?: PolymarketMarketContext | null,
): BettingLink {
  const url = polymarketUrl(market, resultMarket);

  if (url) {
    return {
      venue: "polymarket",
      url,
      label: "Bet on Polymarket",
      subtitle: "Live market",
    };
  }

  return buildKalshiUrl(fixture);
}