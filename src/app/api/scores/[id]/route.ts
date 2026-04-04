import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPN_SPORT_PATHS: Record<string, string> = {
  "mlb": "baseball/mlb",
  "nba": "basketball/nba",
  "nfl": "football/nfl",
  "nhl": "hockey/nhl",
  "ncaaf": "football/college-football",
  "ncaab": "basketball/mens-college-basketball",
  "mls": "soccer/usa.1",
  "epl": "soccer/eng.1",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || "mlb";
  const espnPath = ESPN_SPORT_PATHS[sport];

  if (!espnPath) {
    return NextResponse.json({ error: "Unknown sport" }, { status: 400 });
  }

  try {
    // Fetch game summary from ESPN
    const [sportType, league] = espnPath.split("/");
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sportType}/${league}/summary?event=${id}`;
    const res = await fetch(url, { next: { revalidate: 30 } });
    const data = await res.json();

    const boxscore = data.boxscore;
    const gameInfo = data.gameInfo;
    const header = data.header;

    // Extract team info from header
    const competition = header?.competitions?.[0];
    const competitors = competition?.competitors || [];
    const homeComp = competitors.find((c: Record<string, unknown>) => c.homeAway === "home");
    const awayComp = competitors.find((c: Record<string, unknown>) => c.homeAway === "away");

    const homeTeam = homeComp?.team;
    const awayTeam = awayComp?.team;

    const statusType = competition?.status?.type;

    // Extract player stats from boxscore
    const playerStats = (boxscore?.players || []).map((teamStats: Record<string, unknown>) => {
      const team = teamStats.team as Record<string, unknown>;
      const statistics = (teamStats.statistics as Record<string, unknown>[]) || [];

      const categories = statistics.map((stat: Record<string, unknown>) => {
        const labels = (stat.labels as string[]) || [];
        const athletes = (stat.athletes as Record<string, unknown>[]) || [];

        const players = athletes.map((athlete: Record<string, unknown>) => {
          const a = athlete.athlete as Record<string, unknown>;
          return {
            id: a?.id,
            name: a?.displayName || a?.shortName,
            shortName: a?.shortName,
            jersey: a?.jersey,
            position: (a?.position as Record<string, unknown>)?.abbreviation,
            stats: athlete.stats as string[],
            starter: athlete.starter,
          };
        });

        return {
          name: stat.name,
          displayName: stat.displayName,
          labels,
          players,
        };
      });

      return {
        teamId: team?.id,
        teamName: team?.displayName,
        teamAbbr: team?.abbreviation,
        teamLogo: team?.logo,
        categories,
      };
    });

    // Extract team stats
    const teamStats = (boxscore?.teams || []).map((teamStat: Record<string, unknown>) => {
      const team = teamStat.team as Record<string, unknown>;
      const statistics = (teamStat.statistics as Record<string, unknown>[]) || [];
      return {
        teamId: team?.id,
        teamName: team?.displayName,
        teamAbbr: team?.abbreviation,
        stats: statistics.map((s: Record<string, unknown>) => ({
          name: s.name,
          displayName: s.displayName,
          displayValue: s.displayValue,
        })),
      };
    });

    // Line score (innings/quarters)
    const linescores = competitors.map((c: Record<string, unknown>) => ({
      teamId: (c.team as Record<string, unknown>)?.id,
      teamAbbr: (c.team as Record<string, unknown>)?.abbreviation,
      homeAway: c.homeAway,
      score: c.score,
      linescores: (c.linescores as Record<string, unknown>[])?.map((ls: Record<string, unknown>) => ls.value) || [],
    }));

    return NextResponse.json({
      id,
      sport,
      state: statusType?.state || "pre",
      statusDetail: statusType?.shortDetail || "",
      home: {
        id: homeTeam?.id,
        name: homeTeam?.displayName,
        abbreviation: homeTeam?.abbreviation,
        logo: homeTeam?.logo,
        score: homeComp?.score,
        record: homeComp?.record,
        winner: homeComp?.winner,
      },
      away: {
        id: awayTeam?.id,
        name: awayTeam?.displayName,
        abbreviation: awayTeam?.abbreviation,
        logo: awayTeam?.logo,
        score: awayComp?.score,
        record: awayComp?.record,
        winner: awayComp?.winner,
      },
      venue: gameInfo?.venue?.fullName || null,
      attendance: gameInfo?.attendance || null,
      linescores,
      playerStats,
      teamStats,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch game details" }, { status: 500 });
  }
}
