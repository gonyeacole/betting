"use client";

import { useEffect, useState, useCallback } from "react";

interface Game {
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
}

const SPORTS_FILTER = ["All", "NFL", "NBA", "MLB", "NHL", "NCAA Football", "NCAA Basketball", "EPL", "La Liga", "MLS", "MMA/UFC"];

// ESPN team logo lookup
const ESPN_SPORT_MAP: Record<string, string> = {
  "NFL": "football/nfl",
  "NBA": "basketball/nba",
  "MLB": "baseball/mlb",
  "NHL": "hockey/nhl",
  "NCAA Football": "football/college-football",
  "NCAA Basketball": "basketball/mens-college-basketball",
  "EPL": "soccer/eng.1",
  "La Liga": "soccer/esp.1",
  "Serie A": "soccer/ita.1",
  "Bundesliga": "soccer/ger.1",
  "Ligue 1": "soccer/fra.1",
  "MLS": "soccer/usa.1",
};

// Common team name abbreviations
const TEAM_ABBREVS: Record<string, string> = {
  "Arizona Cardinals": "ARI", "Atlanta Falcons": "ATL", "Baltimore Ravens": "BAL",
  "Buffalo Bills": "BUF", "Carolina Panthers": "CAR", "Chicago Bears": "CHI",
  "Cincinnati Bengals": "CIN", "Cleveland Browns": "CLE", "Dallas Cowboys": "DAL",
  "Denver Broncos": "DEN", "Detroit Lions": "DET", "Green Bay Packers": "GB",
  "Houston Texans": "HOU", "Indianapolis Colts": "IND", "Jacksonville Jaguars": "JAX",
  "Kansas City Chiefs": "KC", "Las Vegas Raiders": "LV", "Los Angeles Chargers": "LAC",
  "Los Angeles Rams": "LAR", "Miami Dolphins": "MIA", "Minnesota Vikings": "MIN",
  "New England Patriots": "NE", "New Orleans Saints": "NO", "New York Giants": "NYG",
  "New York Jets": "NYJ", "Philadelphia Eagles": "PHI", "Pittsburgh Steelers": "PIT",
  "San Francisco 49ers": "SF", "Seattle Seahawks": "SEA", "Tampa Bay Buccaneers": "TB",
  "Tennessee Titans": "TEN", "Washington Commanders": "WSH",
  "Atlanta Hawks": "ATL", "Boston Celtics": "BOS", "Brooklyn Nets": "BKN",
  "Charlotte Hornets": "CHA", "Chicago Bulls": "CHI", "Cleveland Cavaliers": "CLE",
  "Dallas Mavericks": "DAL", "Denver Nuggets": "DEN", "Detroit Pistons": "DET",
  "Golden State Warriors": "GSW", "Houston Rockets": "HOU", "Indiana Pacers": "IND",
  "Los Angeles Clippers": "LAC", "Los Angeles Lakers": "LAL", "Memphis Grizzlies": "MEM",
  "Miami Heat": "MIA", "Milwaukee Bucks": "MIL", "Minnesota Timberwolves": "MIN",
  "New Orleans Pelicans": "NOP", "New York Knicks": "NYK", "Oklahoma City Thunder": "OKC",
  "Orlando Magic": "ORL", "Philadelphia 76ers": "PHI", "Phoenix Suns": "PHX",
  "Portland Trail Blazers": "POR", "Sacramento Kings": "SAC", "San Antonio Spurs": "SAS",
  "Toronto Raptors": "TOR", "Utah Jazz": "UTA", "Washington Wizards": "WAS",
  "Arizona Diamondbacks": "ARI", "Atlanta Braves": "ATL", "Baltimore Orioles": "BAL",
  "Boston Red Sox": "BOS", "Chicago Cubs": "CHC", "Chicago White Sox": "CWS",
  "Cincinnati Reds": "CIN", "Cleveland Guardians": "CLE", "Colorado Rockies": "COL",
  "Detroit Tigers": "DET", "Houston Astros": "HOU", "Kansas City Royals": "KC",
  "Los Angeles Angels": "LAA", "Los Angeles Dodgers": "LAD", "Miami Marlins": "MIA",
  "Milwaukee Brewers": "MIL", "Minnesota Twins": "MIN", "New York Mets": "NYM",
  "New York Yankees": "NYY", "Oakland Athletics": "OAK", "Philadelphia Phillies": "PHI",
  "Pittsburgh Pirates": "PIT", "San Diego Padres": "SD", "San Francisco Giants": "SF",
  "Seattle Mariners": "SEA", "St. Louis Cardinals": "STL", "Tampa Bay Rays": "TB",
  "Texas Rangers": "TEX", "Toronto Blue Jays": "TOR", "Washington Nationals": "WSH",
  "Anaheim Ducks": "ANA", "Arizona Coyotes": "ARI", "Boston Bruins": "BOS",
  "Buffalo Sabres": "BUF", "Calgary Flames": "CGY", "Carolina Hurricanes": "CAR",
  "Chicago Blackhawks": "CHI", "Colorado Avalanche": "COL", "Columbus Blue Jackets": "CBJ",
  "Dallas Stars": "DAL", "Detroit Red Wings": "DET", "Edmonton Oilers": "EDM",
  "Florida Panthers": "FLA", "Los Angeles Kings": "LAK", "Minnesota Wild": "MIN",
  "Montreal Canadiens": "MTL", "Nashville Predators": "NSH", "New Jersey Devils": "NJD",
  "New York Islanders": "NYI", "New York Rangers": "NYR", "Ottawa Senators": "OTT",
  "Philadelphia Flyers": "PHI", "Pittsburgh Penguins": "PIT", "San Jose Sharks": "SJS",
  "Seattle Kraken": "SEA", "St. Louis Blues": "STL", "Tampa Bay Lightning": "TBL",
  "Toronto Maple Leafs": "TOR", "Vancouver Canucks": "VAN", "Vegas Golden Knights": "VGK",
  "Washington Capitals": "WSH", "Winnipeg Jets": "WPG",
};

function getTeamAbbrev(name: string): string {
  return TEAM_ABBREVS[name] || name.split(" ").pop()?.substring(0, 4).toUpperCase() || name.substring(0, 4).toUpperCase();
}

function formatOdds(odds: number | null): string {
  if (odds === null) return "—";
  return odds > 0 ? `+${odds}` : `${odds}`;
}

function formatSpread(point: number | null): string {
  if (point === null) return "—";
  return point > 0 ? `+${point}` : `${point}`;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const gameDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  let dayLabel = "";
  if (gameDay.getTime() === today.getTime()) dayLabel = "Today";
  else if (gameDay.getTime() === tomorrow.getTime()) dayLabel = "Tomorrow";
  else dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dayLabel} ${time}`;
}

// Component for team logo with fallback
function TeamLogo({ team, sport }: { team: string; sport: string }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const espnSport = ESPN_SPORT_MAP[sport];
    if (!espnSport) return;

    const fetchLogo = async () => {
      try {
        const encoded = encodeURIComponent(team);
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams?limit=1&search=${encoded}`
        );
        const data = await res.json();
        const logo = data?.sports?.[0]?.leagues?.[0]?.teams?.[0]?.team?.logos?.[0]?.href;
        if (logo) setLogoUrl(logo);
      } catch {}
    };
    fetchLogo();
  }, [team, sport]);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={team}
        className="w-8 h-8 object-contain"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }

  // Fallback: colored circle with initial
  return (
    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
      <span className="text-[11px] text-[#888] font-semibold">{getTeamAbbrev(team).substring(0, 2)}</span>
    </div>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSport, setActiveSport] = useState("All");

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch("/api/odds");
      const data = await res.json();
      if (data.error && !data.games?.length) {
        setError(data.message || data.error);
      }
      setGames(data.games || []);
    } catch {
      setError("Failed to load games");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 300000);
    return () => clearInterval(interval);
  }, [fetchGames]);

  const filteredGames = activeSport === "All"
    ? games
    : games.filter(g => g.sport === activeSport);

  // Group by sport
  const groupedBySport: Record<string, Game[]> = {};
  for (const game of filteredGames) {
    if (!groupedBySport[game.sport]) groupedBySport[game.sport] = [];
    groupedBySport[game.sport].push(game);
  }

  if (loading) {
    return (
      <div className="animate-fade-in-up">
        <div className="text-center py-20">
          <div className="text-[14px] text-[#555] animate-shimmer">Loading games...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-xl font-semibold mb-6">Games</h1>

      {/* Sport Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {SPORTS_FILTER.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-4 py-1.5 text-[12px] rounded-full pill-press whitespace-nowrap flex-shrink-0 ${
              activeSport === sport
                ? "bg-[#1a1a1a] text-white tab-active"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {error && !games.length && (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#555] mb-2">No live data available</p>
          <p className="text-[12px] text-[#444] max-w-sm mx-auto">{error}</p>
        </div>
      )}

      {!error && filteredGames.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#555]">No games scheduled for {activeSport}</p>
        </div>
      )}

      {/* Games grouped by sport */}
      <div className="space-y-6">
        {Object.entries(groupedBySport).map(([sport, sportGames]) => (
          <div key={sport}>
            {activeSport === "All" && (
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[12px] text-[#555] uppercase tracking-wider font-medium">{sport}</span>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
                <span className="text-[11px] text-[#444]">{sportGames.length}</span>
              </div>
            )}

            <div className="space-y-3 stagger-children">
              {sportGames.map((game) => (
                <div key={game.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden card-hover">
                  {/* Column Headers */}
                  <div className="flex items-center px-4 pt-3 pb-1">
                    <div className="flex-1 text-[11px] text-[#444]">Matchup</div>
                    <div className="grid grid-cols-3 gap-2 w-[280px] md:w-[340px]">
                      <div className="text-[11px] text-[#444] text-center">Spread</div>
                      <div className="text-[11px] text-[#444] text-center">Total</div>
                      <div className="text-[11px] text-[#444] text-center">ML</div>
                    </div>
                  </div>

                  {/* Away Team Row */}
                  <div className="flex items-center px-4 py-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <TeamLogo team={game.awayTeam} sport={game.sport} />
                      <div className="min-w-0">
                        <span className="text-[14px] font-semibold text-white block truncate">{getTeamAbbrev(game.awayTeam)}</span>
                        {game.awayScore !== null && (
                          <span className="text-[11px] text-[#555]">{game.awayScore}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-[280px] md:w-[340px]">
                      {/* Spread */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className="text-[13px] font-semibold text-white">{formatSpread(game.spread.awayPoint)}</div>
                        <div className="text-[11px] text-[#555]">{formatOdds(game.spread.away)}</div>
                      </div>
                      {/* Total Over */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className="text-[13px] font-semibold text-white">o{game.total.point ?? "—"}</div>
                        <div className="text-[11px] text-[#555]">{formatOdds(game.total.over)}</div>
                      </div>
                      {/* Moneyline */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className={`text-[13px] font-semibold ${game.moneyline.away !== null && game.moneyline.away > 0 ? "text-[#4ade80]" : "text-white"}`}>
                          {formatOdds(game.moneyline.away)}
                        </div>
                        <div className="text-[11px] text-[#555]">ML</div>
                      </div>
                    </div>
                  </div>

                  {/* Home Team Row */}
                  <div className="flex items-center px-4 py-2">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <TeamLogo team={game.homeTeam} sport={game.sport} />
                      <div className="min-w-0">
                        <span className="text-[14px] font-semibold text-white block truncate">{getTeamAbbrev(game.homeTeam)}</span>
                        {game.homeScore !== null && (
                          <span className="text-[11px] text-[#555]">{game.homeScore}</span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-[280px] md:w-[340px]">
                      {/* Spread */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className="text-[13px] font-semibold text-white">{formatSpread(game.spread.homePoint)}</div>
                        <div className="text-[11px] text-[#555]">{formatOdds(game.spread.home)}</div>
                      </div>
                      {/* Total Under */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className="text-[13px] font-semibold text-white">u{game.total.point ?? "—"}</div>
                        <div className="text-[11px] text-[#555]">{formatOdds(game.total.under)}</div>
                      </div>
                      {/* Moneyline */}
                      <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                        <div className={`text-[13px] font-semibold ${game.moneyline.home !== null && game.moneyline.home > 0 ? "text-[#4ade80]" : "text-white"}`}>
                          {formatOdds(game.moneyline.home)}
                        </div>
                        <div className="text-[11px] text-[#555]">ML</div>
                      </div>
                    </div>
                  </div>

                  {/* Draw row for soccer */}
                  {game.moneyline.draw !== null && (
                    <div className="flex items-center px-4 py-2">
                      <div className="flex items-center gap-2.5 flex-1">
                        <div className="w-8" />
                        <span className="text-[13px] text-[#555]">Draw</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 w-[280px] md:w-[340px]">
                        <div />
                        <div />
                        <div className="bg-[#111] rounded-xl px-2 py-2.5 text-center pill-press cursor-default">
                          <div className="text-[13px] font-semibold text-[#888]">{formatOdds(game.moneyline.draw)}</div>
                          <div className="text-[11px] text-[#555]">ML</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer: time / status */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#222]">
                    <div className="flex items-center gap-2">
                      {game.isLive ? (
                        <span className="text-[11px] text-[#f87171] bg-[#2e1a1a] px-2.5 py-0.5 rounded-full animate-shimmer font-medium">
                          LIVE
                        </span>
                      ) : game.completed ? (
                        <span className="text-[11px] text-[#555] bg-[#222] px-2.5 py-0.5 rounded-full">FINAL</span>
                      ) : (
                        <span className="text-[11px] text-[#555]">{formatTime(game.startTime)}</span>
                      )}
                    </div>
                    {game.isLive && game.homeScore !== null && game.awayScore !== null && (
                      <span className="text-[12px] text-white font-medium">
                        {game.awayScore} - {game.homeScore}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
