import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPN_SPORTS: Record<string, string> = {
  "americanfootball_nfl": "football/nfl",
  "americanfootball_ncaaf": "football/college-football",
  "basketball_nba": "basketball/nba",
  "basketball_ncaab": "basketball/mens-college-basketball",
  "baseball_mlb": "baseball/mlb",
  "icehockey_nhl": "hockey/nhl",
  "soccer_epl": "soccer/eng.1",
  "soccer_spain_la_liga": "soccer/esp.1",
  "soccer_usa_mls": "soccer/usa.1",
};

const ESPN_SPORT_PARAM: Record<string, string> = {
  "americanfootball_nfl": "nfl",
  "americanfootball_ncaaf": "ncaaf",
  "basketball_nba": "nba",
  "basketball_ncaab": "ncaab",
  "baseball_mlb": "mlb",
  "icehockey_nhl": "nhl",
  "soccer_epl": "epl",
  "soccer_spain_la_liga": "epl",
  "soccer_usa_mls": "mls",
};

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z]/g, "");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sportKey = searchParams.get("sportKey") || "";
  const homeTeam = searchParams.get("home") || "";
  const awayTeam = searchParams.get("away") || "";
  const gameDate = searchParams.get("date") || "";

  const espnPath = ESPN_SPORTS[sportKey];
  const espnSport = ESPN_SPORT_PARAM[sportKey];

  if (!espnPath || !espnSport) {
    return NextResponse.json({ error: "Sport not supported", eventId: null, sport: null });
  }

  try {
    // Format date for ESPN (YYYYMMDD)
    const d = gameDate ? new Date(gameDate) : new Date();
    const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");

    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/scoreboard?dates=${dateStr}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    const homeNorm = normalize(homeTeam);
    const awayNorm = normalize(awayTeam);

    for (const event of data.events || []) {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors || [];
      const home = competitors.find((c: Record<string, unknown>) => c.homeAway === "home");
      const away = competitors.find((c: Record<string, unknown>) => c.homeAway === "away");

      const hName = normalize((home?.team as Record<string, unknown>)?.displayName as string || "");
      const aName = normalize((away?.team as Record<string, unknown>)?.displayName as string || "");

      // Check if teams match (fuzzy: one name contains the other)
      const homeMatch = hName.includes(homeNorm) || homeNorm.includes(hName);
      const awayMatch = aName.includes(awayNorm) || awayNorm.includes(aName);

      if (homeMatch && awayMatch) {
        return NextResponse.json({ eventId: event.id, sport: espnSport });
      }
    }

    return NextResponse.json({ eventId: null, sport: espnSport });
  } catch {
    return NextResponse.json({ error: "Lookup failed", eventId: null, sport: null }, { status: 500 });
  }
}
