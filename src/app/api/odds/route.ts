import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The Odds API sport keys mapped to display names
const SPORT_MAP: Record<string, string> = {
  "americanfootball_nfl": "NFL",
  "americanfootball_ncaaf": "NCAA Football",
  "basketball_nba": "NBA",
  "basketball_ncaab": "NCAA Basketball",
  "baseball_mlb": "MLB",
  "icehockey_nhl": "NHL",
  "soccer_epl": "EPL",
  "soccer_spain_la_liga": "La Liga",
  "soccer_italy_serie_a": "Serie A",
  "soccer_germany_bundesliga": "Bundesliga",
  "soccer_france_ligue_one": "Ligue 1",
  "soccer_usa_mls": "MLS",
  "mma_mixed_martial_arts": "MMA/UFC",
  "tennis_atp_french_open": "Tennis",
  "golf_masters_tournament_winner": "Golf",
};

const ACTIVE_SPORTS = [
  "americanfootball_nfl",
  "basketball_nba",
  "baseball_mlb",
  "icehockey_nhl",
  "americanfootball_ncaaf",
  "basketball_ncaab",
  "soccer_epl",
  "soccer_spain_la_liga",
  "soccer_usa_mls",
  "mma_mixed_martial_arts",
];

interface OddsGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: {
    key: string;
    title: string;
    markets: {
      key: string;
      outcomes: {
        name: string;
        price: number;
        point?: number;
      }[];
    }[];
  }[];
}

interface ScoreGame {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  completed: boolean;
  scores: { name: string; score: string }[] | null;
  last_update: string | null;
}

export async function GET(req: Request) {
  const apiKey = process.env.THE_ODDS_API_KEY;
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get("sport") || "all";

  if (!apiKey) {
    return NextResponse.json({
      error: "API key not configured",
      message: "Add THE_ODDS_API_KEY to your Vercel environment variables. Get a free key at https://the-odds-api.com",
      games: [],
    });
  }

  try {
    const sportsToFetch = sport === "all"
      ? ACTIVE_SPORTS
      : ACTIVE_SPORTS.filter(s => {
          const displayName = SPORT_MAP[s] || s;
          return displayName.toLowerCase() === sport.toLowerCase() || s === sport;
        });

    // Fetch odds and scores in parallel for each sport
    const allGames: {
      id: string;
      sport: string;
      sportKey: string;
      homeTeam: string;
      awayTeam: string;
      startTime: string;
      isLive: boolean;
      completed: boolean;
      homeScore: string | null;
      awayScore: string | null;
      moneyline: { home: number | null; away: number | null; draw: number | null };
      spread: { home: number | null; homePoint: number | null; away: number | null; awayPoint: number | null };
      total: { over: number | null; under: number | null; point: number | null };
    }[] = [];

    const fetchPromises = sportsToFetch.map(async (sportKey) => {
      try {
        // Fetch odds
        const oddsUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`;
        const oddsRes = await fetch(oddsUrl, { next: { revalidate: 300 } });

        if (!oddsRes.ok) return;

        const oddsData: OddsGame[] = await oddsRes.json();

        // Try to fetch scores
        let scoresMap: Record<string, ScoreGame> = {};
        try {
          const scoresUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/scores/?apiKey=${apiKey}&daysFrom=1`;
          const scoresRes = await fetch(scoresUrl, { next: { revalidate: 60 } });
          if (scoresRes.ok) {
            const scoresData: ScoreGame[] = await scoresRes.json();
            scoresMap = Object.fromEntries(scoresData.map(s => [s.id, s]));
          }
        } catch {
          // Scores not available for this sport
        }

        for (const game of oddsData) {
          const scoreData = scoresMap[game.id];
          const now = new Date();
          const gameTime = new Date(game.commence_time);
          const isLive = gameTime <= now && !scoreData?.completed;

          // Get first available bookmaker's odds
          const bookmaker = game.bookmakers[0];
          const h2h = bookmaker?.markets.find(m => m.key === "h2h");
          const spreads = bookmaker?.markets.find(m => m.key === "spreads");
          const totals = bookmaker?.markets.find(m => m.key === "totals");

          const homeH2h = h2h?.outcomes.find(o => o.name === game.home_team);
          const awayH2h = h2h?.outcomes.find(o => o.name === game.away_team);
          const drawH2h = h2h?.outcomes.find(o => o.name === "Draw");

          const homeSpread = spreads?.outcomes.find(o => o.name === game.home_team);
          const awaySpread = spreads?.outcomes.find(o => o.name === game.away_team);

          const over = totals?.outcomes.find(o => o.name === "Over");
          const under = totals?.outcomes.find(o => o.name === "Under");

          const homeScore = scoreData?.scores?.find(s => s.name === game.home_team)?.score || null;
          const awayScore = scoreData?.scores?.find(s => s.name === game.away_team)?.score || null;

          allGames.push({
            id: game.id,
            sport: SPORT_MAP[sportKey] || game.sport_title,
            sportKey,
            homeTeam: game.home_team,
            awayTeam: game.away_team,
            startTime: game.commence_time,
            isLive,
            completed: scoreData?.completed || false,
            homeScore,
            awayScore,
            moneyline: {
              home: homeH2h?.price || null,
              away: awayH2h?.price || null,
              draw: drawH2h?.price || null,
            },
            spread: {
              home: homeSpread?.price || null,
              homePoint: homeSpread?.point || null,
              away: awaySpread?.price || null,
              awayPoint: awaySpread?.point || null,
            },
            total: {
              over: over?.price || null,
              under: under?.price || null,
              point: over?.point || null,
            },
          });
        }
      } catch {
        // Skip failed sport
      }
    });

    await Promise.all(fetchPromises);

    // Sort: live first, then by start time
    allGames.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    return NextResponse.json({ games: allGames });
  } catch {
    return NextResponse.json({ error: "Failed to fetch odds", games: [] }, { status: 500 });
  }
}
