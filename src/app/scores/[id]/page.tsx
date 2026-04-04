"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  score: string;
  record: string;
  winner: boolean;
}

interface Player {
  id: string;
  name: string;
  shortName: string;
  jersey: string;
  position: string;
  stats: string[];
  starter: boolean;
}

interface StatCategory {
  name: string;
  displayName: string;
  labels: string[];
  players: Player[];
}

interface TeamPlayerStats {
  teamId: string;
  teamName: string;
  teamAbbr: string;
  teamLogo: string;
  categories: StatCategory[];
}

interface TeamStat {
  name: string;
  displayName: string;
  displayValue: string;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  teamAbbr: string;
  stats: TeamStat[];
}

interface LineScore {
  teamId: string;
  teamAbbr: string;
  homeAway: string;
  score: string;
  linescores: number[];
}

interface GameDetail {
  id: string;
  sport: string;
  state: string;
  statusDetail: string;
  home: TeamInfo;
  away: TeamInfo;
  venue: string | null;
  attendance: number | null;
  linescores: LineScore[];
  playerStats: TeamPlayerStats[];
  teamStats: TeamStats[];
}

export default function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const sport = searchParams.get("sport") || "mlb";
  const [game, setGame] = useState<GameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState(0); // 0 = away, 1 = home

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/scores/${id}?sport=${sport}`);
        const data = await res.json();
        setGame(data);
      } catch {
        // Error fetching
      }
      setLoading(false);
    };
    fetchGame();
    const interval = setInterval(fetchGame, 30000);
    return () => clearInterval(interval);
  }, [id, sport]);

  if (loading) {
    return (
      <div className="animate-fade-in-up text-center py-20">
        <div className="text-[14px] text-[#555] animate-shimmer">Loading...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-[#555]">Game not found</p>
        <Link href="/scores" className="text-[13px] text-[#888] hover:text-white mt-4 inline-block">Back to Scores</Link>
      </div>
    );
  }

  const isLive = game.state === "in";
  const isFinal = game.state === "post";
  const awayLine = game.linescores.find(l => l.homeAway === "away");
  const homeLine = game.linescores.find(l => l.homeAway === "home");

  // Determine which team's stats to show
  const selectedStats = game.playerStats[activeTeam];

  return (
    <div className="animate-fade-in-up">
      <Link href="/scores" className="text-[12px] text-[#555] hover:text-white pill-press inline-block mb-4">
        ← Scores
      </Link>

      {/* Scoreboard header */}
      <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-4">
        <div className="text-center mb-3">
          <span className={`text-[12px] font-medium ${isLive ? "text-[#f87171]" : "text-[#555]"}`}>
            {game.statusDetail || (isFinal ? "Final" : "Scheduled")}
          </span>
        </div>

        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Away */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            {game.away.logo && <img src={game.away.logo} alt="" className="w-12 h-12 object-contain" />}
            <span className="text-[14px] font-bold text-white">{game.away.abbreviation}</span>
            <span className="text-[11px] text-[#555]">{game.away.record}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span className={`text-[36px] font-bold tabular-nums ${isFinal && !game.away.winner ? "text-[#666]" : "text-white"}`}>
              {game.away.score || "0"}
            </span>
            <span className="text-[20px] text-[#444]">-</span>
            <span className={`text-[36px] font-bold tabular-nums ${isFinal && !game.home.winner ? "text-[#666]" : "text-white"}`}>
              {game.home.score || "0"}
            </span>
          </div>

          {/* Home */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            {game.home.logo && <img src={game.home.logo} alt="" className="w-12 h-12 object-contain" />}
            <span className="text-[14px] font-bold text-white">{game.home.abbreviation}</span>
            <span className="text-[11px] text-[#555]">{game.home.record}</span>
          </div>
        </div>

        {/* Venue */}
        {game.venue && (
          <div className="text-center text-[11px] text-[#444]">
            {game.venue}{game.attendance ? ` · ${game.attendance.toLocaleString()}` : ""}
          </div>
        )}
      </div>

      {/* Line score / box score */}
      {awayLine && homeLine && awayLine.linescores.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-4 overflow-x-auto scrollbar-hide">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[#555]">
                <th className="text-left font-medium py-1 pr-4 w-16">Team</th>
                {awayLine.linescores.map((_, i) => (
                  <th key={i} className="text-center font-medium py-1 px-1.5 min-w-[24px]">{i + 1}</th>
                ))}
                <th className="text-center font-bold py-1 px-2 text-white border-l border-[#333] min-w-[30px]">T</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left font-semibold text-white py-1.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    {game.away.logo && <img src={game.away.logo} alt="" className="w-4 h-4" />}
                    {game.away.abbreviation}
                  </div>
                </td>
                {awayLine.linescores.map((score, i) => (
                  <td key={i} className="text-center text-[#888] py-1.5 px-1.5">{score}</td>
                ))}
                <td className="text-center font-bold text-white py-1.5 px-2 border-l border-[#333]">{game.away.score}</td>
              </tr>
              <tr>
                <td className="text-left font-semibold text-white py-1.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    {game.home.logo && <img src={game.home.logo} alt="" className="w-4 h-4" />}
                    {game.home.abbreviation}
                  </div>
                </td>
                {homeLine.linescores.map((score, i) => (
                  <td key={i} className="text-center text-[#888] py-1.5 px-1.5">{score}</td>
                ))}
                <td className="text-center font-bold text-white py-1.5 px-2 border-l border-[#333]">{game.home.score}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Team Stats comparison */}
      {game.teamStats.length === 2 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-4 mb-4">
          <h3 className="text-[13px] font-semibold text-white mb-3">Team Stats</h3>
          <div className="space-y-2">
            {game.teamStats[0].stats.slice(0, 10).map((stat, i) => {
              const otherStat = game.teamStats[1].stats[i];
              if (!otherStat) return null;
              return (
                <div key={stat.name} className="flex items-center text-[12px]">
                  <span className="w-12 text-right text-white font-medium">{stat.displayValue}</span>
                  <div className="flex-1 text-center text-[#555] text-[11px] px-2">{stat.displayName}</div>
                  <span className="w-12 text-left text-white font-medium">{otherStat.displayValue}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Player Stats */}
      {game.playerStats.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl overflow-hidden mb-4">
          {/* Team toggle */}
          <div className="flex border-b border-[#222]">
            {game.playerStats.map((team, i) => (
              <button
                key={team.teamId}
                onClick={() => setActiveTeam(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-medium pill-press ${
                  activeTeam === i ? "text-white bg-[#222]" : "text-[#555] hover:text-[#888]"
                }`}
              >
                {team.teamLogo && <img src={team.teamLogo} alt="" className="w-5 h-5" />}
                {team.teamAbbr}
              </button>
            ))}
          </div>

          {/* Stat categories */}
          {selectedStats && selectedStats.categories.map((cat) => (
            <div key={cat.name} className="border-b border-[#222] last:border-b-0">
              <div className="px-4 py-2 bg-[#111]">
                <span className="text-[11px] text-[#555] uppercase tracking-wider font-medium">{cat.displayName}</span>
              </div>

              {/* Column headers */}
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-[11px] min-w-[400px]">
                  <thead>
                    <tr className="text-[#555]">
                      <th className="text-left py-1.5 px-3 font-medium sticky left-0 bg-[#1a1a1a] w-32">Player</th>
                      {cat.labels.map((label) => (
                        <th key={label} className="text-center py-1.5 px-1.5 font-medium min-w-[36px]">{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cat.players.map((player) => (
                      <tr key={player.id} className="border-t border-[#222] hover:bg-[#151515] transition-colors">
                        <td className="text-left py-2 px-3 sticky left-0 bg-[#1a1a1a]">
                          <span className="text-[12px] text-white font-medium">{player.shortName || player.name}</span>
                          {player.position && <span className="text-[10px] text-[#555] ml-1">{player.position}</span>}
                        </td>
                        {player.stats.map((s, si) => (
                          <td key={si} className="text-center py-2 px-1.5 text-[#888] tabular-nums">{s}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {selectedStats && selectedStats.categories.length === 0 && (
            <div className="py-8 text-center text-[13px] text-[#555]">No player stats available yet</div>
          )}
        </div>
      )}
    </div>
  );
}
