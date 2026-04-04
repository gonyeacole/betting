import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPN_SPORTS: Record<string, string> = {
  "mlb": "baseball/mlb",
  "nba": "basketball/nba",
  "nfl": "football/nfl",
  "nhl": "hockey/nhl",
  "ncaaf": "football/college-football",
  "ncaab": "basketball/mens-college-basketball",
  "mls": "soccer/usa.1",
  "epl": "soccer/eng.1",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || "mlb";
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0].replace(/-/g, "");

  const espnPath = ESPN_SPORTS[sport];
  if (!espnPath) {
    return NextResponse.json({ error: "Unknown sport", events: [] });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnPath}/scoreboard?dates=${date}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json();

    const events = (data.events || []).map((event: Record<string, unknown>) => {
      const competition = (event.competitions as Record<string, unknown>[])?.[0];
      const competitors = (competition?.competitors as Record<string, unknown>[]) || [];
      const status = competition?.status as Record<string, unknown> | undefined;
      const statusType = status?.type as Record<string, unknown> | undefined;
      const situation = competition?.situation as Record<string, unknown> | undefined;

      const home = competitors.find((c: Record<string, unknown>) => c.homeAway === "home");
      const away = competitors.find((c: Record<string, unknown>) => c.homeAway === "away");

      const homeTeam = home?.team as Record<string, unknown> | undefined;
      const awayTeam = away?.team as Record<string, unknown> | undefined;

      const homeRecords = (home?.records as Record<string, unknown>[])?.find(
        (r: Record<string, unknown>) => r.name === "overall" || r.type === "total"
      );
      const awayRecords = (away?.records as Record<string, unknown>[])?.find(
        (r: Record<string, unknown>) => r.name === "overall" || r.type === "total"
      );

      return {
        id: event.id,
        name: event.name,
        shortName: event.shortName,
        date: event.date,
        state: statusType?.state || "pre", // pre, in, post
        statusDetail: statusType?.shortDetail || status?.displayClock || "",
        period: status?.period || 0,
        clock: status?.displayClock || "",
        home: {
          id: homeTeam?.id,
          name: homeTeam?.displayName,
          abbreviation: homeTeam?.abbreviation,
          logo: homeTeam?.logo,
          score: home?.score || "0",
          record: homeRecords?.summary || "",
          winner: home?.winner || false,
        },
        away: {
          id: awayTeam?.id,
          name: awayTeam?.displayName,
          abbreviation: awayTeam?.abbreviation,
          logo: awayTeam?.logo,
          score: away?.score || "0",
          record: awayRecords?.summary || "",
          winner: away?.winner || false,
        },
        situation: situation ? {
          balls: situation.balls,
          strikes: situation.strikes,
          outs: situation.outs,
          onFirst: situation.onFirst,
          onSecond: situation.onSecond,
          onThird: situation.onThird,
          shortDownDistanceText: situation.shortDownDistanceText,
        } : null,
        odds: (() => {
          const oddsArr = competition?.odds as Record<string, unknown>[] | undefined;
          const o = oddsArr?.[0];
          if (!o) return null;
          return {
            spread: o.details,
            overUnder: o.overUnder,
            awayML: (o as Record<string, unknown>).awayTeamOdds
              ? ((o as Record<string, unknown>).awayTeamOdds as Record<string, unknown>)?.moneyLine
              : null,
            homeML: (o as Record<string, unknown>).homeTeamOdds
              ? ((o as Record<string, unknown>).homeTeamOdds as Record<string, unknown>)?.moneyLine
              : null,
          };
        })(),
        broadcast: (() => {
          const broadcasts = competition?.broadcasts as Record<string, unknown>[] | undefined;
          const b = broadcasts?.[0];
          const names = (b?.names as string[]) || [];
          return names[0] || null;
        })(),
      };
    });

    return NextResponse.json({
      sport,
      date,
      league: data.leagues?.[0]?.name || sport.toUpperCase(),
      leagueLogo: data.leagues?.[0]?.logos?.[0]?.href || null,
      events,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch scores", events: [] }, { status: 500 });
  }
}
