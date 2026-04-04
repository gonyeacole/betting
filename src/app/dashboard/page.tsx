"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

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

// Global logo cache: team name -> logo URL
const logoCache: Record<string, string | null> = {};
// Track which leagues we've already fetched all teams for
const fetchedLeagues = new Set<string>();

// Pre-fetch all teams for a league and cache their logos
async function prefetchLeagueLogos(sport: string) {
  const espnSport = ESPN_SPORT_MAP[sport];
  if (!espnSport || fetchedLeagues.has(espnSport)) return;
  fetchedLeagues.add(espnSport);

  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams?limit=100`
    );
    const data = await res.json();
    const teams = data?.sports?.[0]?.leagues?.[0]?.teams || [];
    for (const entry of teams) {
      const t = entry.team;
      if (t?.displayName && t?.logos?.[0]?.href) {
        logoCache[t.displayName.toLowerCase()] = t.logos[0].href;
        // Also cache by location + name, nickname, abbreviation, etc.
        if (t.name) logoCache[t.name.toLowerCase()] = t.logos[0].href;
        if (t.shortDisplayName) logoCache[t.shortDisplayName.toLowerCase()] = t.logos[0].href;
        if (t.location) logoCache[t.location.toLowerCase()] = t.logos[0].href;
        // Full variations
        const full = `${t.location} ${t.name}`.toLowerCase();
        logoCache[full] = t.logos[0].href;
      }
    }
  } catch {
    // Failed to fetch league teams
  }
}

function findLogo(teamName: string): string | null {
  const lower = teamName.toLowerCase();
  // Direct match
  if (logoCache[lower]) return logoCache[lower];
  // Try partial matches
  for (const key of Object.keys(logoCache)) {
    if (logoCache[key] && (lower.includes(key) || key.includes(lower))) {
      return logoCache[key];
    }
  }
  return null;
}

function getShortName(name: string): string {
  const parts = name.split(" ");
  return parts[parts.length - 1];
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
  else if (gameDay.getTime() === tomorrow.getTime()) dayLabel = "Tmrw";
  else dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dayLabel} ${time}`;
}

function TeamLogo({ team }: { team: string }) {
  const logo = findLogo(team);
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt=""
        className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  const initials = team.split(" ").pop()?.substring(0, 2).toUpperCase() || "??";
  return (
    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0">
      <span className="text-[9px] text-[#666] font-bold">{initials}</span>
    </div>
  );
}

function OddsCell({ top, bottom, green }: { top: string; bottom: string; green?: boolean }) {
  return (
    <div className="bg-[#111] rounded-lg px-1 py-2 text-center pill-press cursor-default min-w-0">
      <div className={`text-[12px] md:text-[13px] font-semibold leading-tight ${green ? "text-[#4ade80]" : "text-white"}`}>{top}</div>
      <div className="text-[10px] md:text-[11px] text-[#555] leading-tight mt-0.5">{bottom}</div>
    </div>
  );
}

function GameCard({ game }: { game: Game }) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleClick = async () => {
    if (navigating) return;
    setNavigating(true);
    try {
      const res = await fetch(
        `/api/espn-lookup?sportKey=${encodeURIComponent(game.sportKey)}&home=${encodeURIComponent(game.homeTeam)}&away=${encodeURIComponent(game.awayTeam)}&date=${encodeURIComponent(game.startTime)}`
      );
      const data = await res.json();
      if (data.eventId && data.sport) {
        router.push(`/scores/${data.eventId}?sport=${data.sport}`);
      } else {
        // Fallback: go to scores page filtered by sport
        setNavigating(false);
      }
    } catch {
      setNavigating(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-[#1a1a1a] rounded-2xl overflow-hidden card-hover cursor-pointer transition-opacity ${navigating ? "opacity-60" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 pt-3 pb-1">
        <div className="text-[10px] md:text-[11px] text-[#444]">
          {game.isLive ? (
            <span className="text-[#f87171] animate-shimmer font-medium">LIVE</span>
          ) : game.completed ? (
            "FINAL"
          ) : (
            formatTime(game.startTime)
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2" style={{ width: "min(60%, 280px)" }}>
          <div className="text-[10px] text-[#444] text-center">Spread</div>
          <div className="text-[10px] text-[#444] text-center">Total</div>
          <div className="text-[10px] text-[#444] text-center">ML</div>
        </div>
      </div>

      {/* Away */}
      <div className="flex items-center px-3 md:px-4 py-1.5">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <TeamLogo team={game.awayTeam} />
          <span className="text-[13px] md:text-[14px] font-semibold text-white truncate">{getShortName(game.awayTeam)}</span>
          {game.awayScore !== null && (
            <span className="text-[14px] font-bold text-white ml-auto">{game.awayScore}</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2" style={{ width: "min(60%, 280px)" }}>
          <OddsCell top={formatSpread(game.spread.awayPoint)} bottom={formatOdds(game.spread.away)} />
          <OddsCell top={`o${game.total.point ?? "—"}`} bottom={formatOdds(game.total.over)} />
          <OddsCell top={formatOdds(game.moneyline.away)} bottom="ML" green={game.moneyline.away !== null && game.moneyline.away > 0} />
        </div>
      </div>

      {/* Home */}
      <div className="flex items-center px-3 md:px-4 py-1.5 pb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
          <TeamLogo team={game.homeTeam} />
          <span className="text-[13px] md:text-[14px] font-semibold text-white truncate">{getShortName(game.homeTeam)}</span>
          {game.homeScore !== null && (
            <span className="text-[14px] font-bold text-white ml-auto">{game.homeScore}</span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5 md:gap-2" style={{ width: "min(60%, 280px)" }}>
          <OddsCell top={formatSpread(game.spread.homePoint)} bottom={formatOdds(game.spread.home)} />
          <OddsCell top={`u${game.total.point ?? "—"}`} bottom={formatOdds(game.total.under)} />
          <OddsCell top={formatOdds(game.moneyline.home)} bottom="ML" green={game.moneyline.home !== null && game.moneyline.home > 0} />
        </div>
      </div>

      {/* Draw for soccer */}
      {game.moneyline.draw !== null && (
        <div className="flex items-center px-3 md:px-4 py-1.5 pb-3">
          <div className="flex items-center gap-2 flex-1 mr-2">
            <div className="w-6 md:w-7" />
            <span className="text-[13px] text-[#555]">Draw</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 md:gap-2" style={{ width: "min(60%, 280px)" }}>
            <div />
            <div />
            <OddsCell top={formatOdds(game.moneyline.draw)} bottom="ML" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSport, setActiveSport] = useState("All");
  const [logosReady, setLogosReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch("/api/odds");
      const data = await res.json();
      if (data.error && !data.games?.length) {
        setError(data.message || data.error);
      }
      const fetchedGames: Game[] = data.games || [];
      setGames(fetchedGames);

      // Pre-fetch logos for all sports that have games
      const sports = Array.from(new Set(fetchedGames.map((g: Game) => g.sport)));
      await Promise.all(sports.map(s => prefetchLeagueLogos(s)));
      setLogosReady(true);
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

  const groupedBySport: Record<string, Game[]> = {};
  for (const game of filteredGames) {
    if (!groupedBySport[game.sport]) groupedBySport[game.sport] = [];
    groupedBySport[game.sport].push(game);
  }

  if (loading) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <div className="text-[14px] text-[#555] animate-shimmer">Loading games...</div>
      </div>
    );
  }

  return (
    <div className={`animate-fade-in-up ${logosReady ? "" : ""}`}>
      <h1 className="text-xl font-semibold mb-5">Games</h1>

      <div ref={scrollRef} className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
        {SPORTS_FILTER.map((sport) => (
          <button
            key={sport}
            onClick={() => setActiveSport(sport)}
            className={`px-3.5 py-1.5 text-[12px] rounded-full pill-press whitespace-nowrap flex-shrink-0 ${
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
          <p className="text-[14px] text-[#555]">No games for {activeSport}</p>
        </div>
      )}

      <div className="space-y-5">
        {Object.entries(groupedBySport).map(([sport, sportGames]) => (
          <div key={sport}>
            {activeSport === "All" && (
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] text-[#555] uppercase tracking-wider font-medium">{sport}</span>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
              </div>
            )}
            <div className="space-y-2 stagger-children">
              {sportGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
