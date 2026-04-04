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

function formatOdds(odds: number | null): string {
  if (odds === null) return "—";
  return odds > 0 ? `+${odds}` : `${odds}`;
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
  return `${dayLabel} · ${time}`;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSport, setActiveSport] = useState("All");
  const [lineType, setLineType] = useState<"moneyline" | "spread" | "total">("moneyline");

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
    // Refresh every 5 minutes
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
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
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

      {/* Line Type Toggle */}
      <div className="flex justify-center gap-1 mb-6 bg-[#111] rounded-full p-1 max-w-xs mx-auto">
        {(["moneyline", "spread", "total"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setLineType(type)}
            className={`flex-1 px-3 py-1.5 text-[11px] rounded-full capitalize pill-press ${
              lineType === type
                ? "bg-[#1a1a1a] text-white tab-active"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {type === "total" ? "O/U" : type}
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
                <span className="text-[11px] text-[#444]">{sportGames.length} games</span>
              </div>
            )}

            <div className="space-y-2 stagger-children">
              {sportGames.map((game) => (
                <div key={game.id} className="bg-[#1a1a1a] rounded-2xl p-4 card-hover">
                  {/* Status badge */}
                  <div className="flex justify-between items-center mb-3">
                    {game.isLive ? (
                      <span className="text-[11px] text-[#f87171] bg-[#2e1a1a] px-2.5 py-0.5 rounded-full animate-shimmer font-medium">
                        LIVE
                      </span>
                    ) : game.completed ? (
                      <span className="text-[11px] text-[#555] bg-[#222] px-2.5 py-0.5 rounded-full">
                        FINAL
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#555]">
                        {formatTime(game.startTime)}
                      </span>
                    )}
                    {activeSport === "All" ? null : (
                      <span className="text-[11px] text-[#444]">{game.sport}</span>
                    )}
                  </div>

                  {/* Teams and Lines */}
                  <div className="space-y-2">
                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[14px] text-white truncate">{game.awayTeam}</span>
                        {game.awayScore !== null && (
                          <span className="text-[16px] font-semibold text-white">{game.awayScore}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {lineType === "moneyline" && (
                          <span className={`text-[13px] font-medium px-3 py-1 rounded-lg bg-[#111] ${
                            game.moneyline.away !== null && game.moneyline.away > 0 ? "text-[#4ade80]" : "text-[#888]"
                          }`}>
                            {formatOdds(game.moneyline.away)}
                          </span>
                        )}
                        {lineType === "spread" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#555]">
                              {game.spread.awayPoint !== null ? (game.spread.awayPoint > 0 ? `+${game.spread.awayPoint}` : game.spread.awayPoint) : "—"}
                            </span>
                            <span className="text-[13px] font-medium text-[#888] px-2 py-1 rounded-lg bg-[#111]">
                              {formatOdds(game.spread.away)}
                            </span>
                          </div>
                        )}
                        {lineType === "total" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#555]">O {game.total.point ?? "—"}</span>
                            <span className="text-[13px] font-medium text-[#888] px-2 py-1 rounded-lg bg-[#111]">
                              {formatOdds(game.total.over)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[#222]" />

                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[14px] text-white truncate">{game.homeTeam}</span>
                        {game.homeScore !== null && (
                          <span className="text-[16px] font-semibold text-white">{game.homeScore}</span>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {lineType === "moneyline" && (
                          <span className={`text-[13px] font-medium px-3 py-1 rounded-lg bg-[#111] ${
                            game.moneyline.home !== null && game.moneyline.home > 0 ? "text-[#4ade80]" : "text-[#888]"
                          }`}>
                            {formatOdds(game.moneyline.home)}
                          </span>
                        )}
                        {lineType === "spread" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#555]">
                              {game.spread.homePoint !== null ? (game.spread.homePoint > 0 ? `+${game.spread.homePoint}` : game.spread.homePoint) : "—"}
                            </span>
                            <span className="text-[13px] font-medium text-[#888] px-2 py-1 rounded-lg bg-[#111]">
                              {formatOdds(game.spread.home)}
                            </span>
                          </div>
                        )}
                        {lineType === "total" && (
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] text-[#555]">U {game.total.point ?? "—"}</span>
                            <span className="text-[13px] font-medium text-[#888] px-2 py-1 rounded-lg bg-[#111]">
                              {formatOdds(game.total.under)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Draw line for soccer */}
                    {lineType === "moneyline" && game.moneyline.draw !== null && (
                      <>
                        <div className="h-px bg-[#222]" />
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] text-[#555]">Draw</span>
                          <span className="text-[13px] font-medium text-[#888] px-3 py-1 rounded-lg bg-[#111]">
                            {formatOdds(game.moneyline.draw)}
                          </span>
                        </div>
                      </>
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
