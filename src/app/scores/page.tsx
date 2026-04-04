"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface TeamInfo {
  id: string;
  name: string;
  abbreviation: string;
  logo: string;
  score: string;
  record: string;
  winner: boolean;
}

interface GameEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  state: string; // pre, in, post
  statusDetail: string;
  period: number;
  clock: string;
  home: TeamInfo;
  away: TeamInfo;
  situation: {
    balls?: number;
    strikes?: number;
    outs?: number;
    onFirst?: boolean;
    onSecond?: boolean;
    onThird?: boolean;
    shortDownDistanceText?: string;
  } | null;
  odds: {
    spread: string;
    overUnder: number;
    awayML: number | null;
    homeML: number | null;
  } | null;
  broadcast: string | null;
}

interface ScoresData {
  sport: string;
  league: string;
  leagueLogo: string | null;
  events: GameEvent[];
}

const SPORTS = [
  { key: "mlb", label: "MLB" },
  { key: "nba", label: "NBA" },
  { key: "nhl", label: "NHL" },
  { key: "nfl", label: "NFL" },
  { key: "ncaab", label: "NCAAB" },
  { key: "ncaaf", label: "NCAAF" },
  { key: "epl", label: "EPL" },
  { key: "mls", label: "MLS" },
];

function formatGameTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatOdds(val: number | null): string {
  if (val === null) return "";
  return val > 0 ? `+${val}` : `${val}`;
}

function getDates(): { label: string; value: string; isToday: boolean }[] {
  const dates = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split("T")[0].replace(/-/g, "");
    let label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (i === 0) label = "Today";
    if (i === -1) label = "Yesterday";
    if (i === 1) label = "Tomorrow";
    dates.push({ label, value, isToday: i === 0 });
  }
  return dates;
}

function GameCard({ game, sport }: { game: GameEvent; sport: string }) {
  const isLive = game.state === "in";
  const isFinal = game.state === "post";
  const isPre = game.state === "pre";

  return (
    <Link href={`/scores/${game.id}?sport=${sport}`} className="block">
      <div className="border-b border-[#222] py-3 px-3 hover:bg-[#151515] transition-colors">
        {/* Status line */}
        <div className="flex justify-between items-center mb-2">
          <span className={`text-[11px] font-medium ${isLive ? "text-[#f87171]" : "text-[#555]"}`}>
            {isLive ? game.statusDetail : isFinal ? "Final" : formatGameTime(game.date)}
          </span>
          <span className="text-[11px] text-[#444]">
            {isPre && game.broadcast ? game.broadcast : ""}
            {isPre && game.odds ? (game.broadcast ? " · " : "") + `o${game.odds.overUnder}` : ""}
          </span>
        </div>

        {/* Away team */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {game.away.logo && (
              <img src={game.away.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
            )}
            <span className={`text-[13px] font-semibold ${isFinal && game.away.winner ? "text-white" : isFinal ? "text-[#666]" : "text-white"}`}>
              {game.away.abbreviation}
            </span>
            <span className="text-[11px] text-[#555]">{game.away.record}</span>
          </div>
          <span className={`text-[14px] font-bold tabular-nums ${isFinal && !game.away.winner ? "text-[#666]" : "text-white"}`}>
            {isPre ? (game.odds ? formatOdds(game.odds.awayML) : "") : game.away.score}
          </span>
        </div>

        {/* Home team */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {game.home.logo && (
              <img src={game.home.logo} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
            )}
            <span className={`text-[13px] font-semibold ${isFinal && game.home.winner ? "text-white" : isFinal ? "text-[#666]" : "text-white"}`}>
              {game.home.abbreviation}
            </span>
            <span className="text-[11px] text-[#555]">{game.home.record}</span>
          </div>
          <span className={`text-[14px] font-bold tabular-nums ${isFinal && !game.home.winner ? "text-[#666]" : "text-white"}`}>
            {isPre ? (game.odds ? formatOdds(game.odds.homeML) : "") : game.home.score}
          </span>
        </div>

        {/* Situation / extra info */}
        {isLive && game.situation && (
          <div className="text-[10px] text-[#555] mt-1">
            {game.situation.outs !== undefined && (
              <span>{game.situation.balls}-{game.situation.strikes}, {game.situation.outs} out</span>
            )}
            {game.situation.shortDownDistanceText && (
              <span>{game.situation.shortDownDistanceText}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ScoresPage() {
  const [sport, setSport] = useState("mlb");
  const [data, setData] = useState<ScoresData | null>(null);
  const [loading, setLoading] = useState(true);
  const dates = getDates();
  const [selectedDate, setSelectedDate] = useState(dates.find(d => d.isToday)?.value || dates[2].value);

  const fetchScores = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scores?sport=${sport}&date=${selectedDate}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    }
    setLoading(false);
  }, [sport, selectedDate]);

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchScores]);

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-xl font-semibold mb-4 text-center">Scores</h1>

      {/* Date picker */}
      <div className="flex justify-center gap-1 mb-4 overflow-x-auto scrollbar-hide -mx-6 px-6">
        {dates.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDate(d.value)}
            className={`px-3 py-1.5 text-[12px] rounded-full pill-press whitespace-nowrap flex-shrink-0 ${
              selectedDate === d.value
                ? "text-white"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {d.label}
            {selectedDate === d.value && (
              <div className="mx-auto mt-1 w-5 h-0.5 rounded-full bg-blue-500" />
            )}
          </button>
        ))}
      </div>

      {/* Sport pills */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-1">
        {SPORTS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSport(s.key)}
            className={`px-3.5 py-1.5 text-[12px] rounded-full pill-press whitespace-nowrap flex-shrink-0 ${
              sport === s.key
                ? "bg-[#1a1a1a] text-white tab-active"
                : "text-[#555] hover:text-[#888]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* League header */}
      {data && (
        <div className="flex items-center gap-2 mb-3 px-1">
          {data.leagueLogo && (
            <img src={data.leagueLogo} alt="" className="w-5 h-5 object-contain" />
          )}
          <span className="text-[13px] font-semibold text-white">{data.league}</span>
        </div>
      )}

      {loading && !data && (
        <div className="text-center py-16">
          <div className="text-[14px] text-[#555] animate-shimmer">Loading scores...</div>
        </div>
      )}

      {data && data.events.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[14px] text-[#555]">No games scheduled</p>
        </div>
      )}

      {/* 2-column grid on all screens */}
      {data && data.events.length > 0 && (
        <div className="grid grid-cols-2 gap-0 bg-[#1a1a1a] rounded-2xl overflow-hidden">
          {data.events.map((game, idx) => (
            <div
              key={game.id}
              className={`${idx % 2 === 0 ? "border-r border-[#222]" : ""}`}
            >
              <GameCard game={game} sport={sport} />
            </div>
          ))}
          {/* Fill odd last cell */}
          {data.events.length % 2 === 1 && <div />}
        </div>
      )}
    </div>
  );
}
