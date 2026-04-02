"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BetCard from "@/components/BetCard";
import ParlayCard from "@/components/ParlayCard";
import StatsCard from "@/components/StatsCard";

interface Bet {
  id: string;
  sport: string;
  league?: string | null;
  eventName: string;
  eventDate: string;
  betType: string;
  selection: string;
  odds: number;
  stake: number;
  potentialPayout: number;
  line?: number | null;
  isLive: boolean;
  result: string;
  profit?: number | null;
  notes?: string | null;
  createdAt: string;
  user: { id: string; name: string; image?: string | null };
  likes: { id: string; userId: string }[];
}

interface Parlay {
  id: string;
  name?: string | null;
  totalOdds: number;
  stake: number;
  potentialPayout: number;
  isSameGame: boolean;
  result: string;
  createdAt: string;
  user: { id: string; name: string; image?: string | null };
  legs: Bet[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bets, setBets] = useState<Bet[]>([]);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [tab, setTab] = useState<"bets" | "parlays">("bets");

  const userId = (session?.user as { id?: string })?.id;

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const [betsRes, parlaysRes] = await Promise.all([
      fetch(`/api/bets?userId=${userId}`),
      fetch(`/api/parlays?userId=${userId}`),
    ]);
    setBets(await betsRes.json());
    setParlays(await parlaysRes.json());
  }, [userId]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (userId) fetchData();
  }, [status, userId, router, fetchData]);

  if (status === "loading") return <div className="text-center py-20 text-[rgba(255,255,255,0.3)] font-light">loading...</div>;
  if (!session) return null;

  const totalBets = bets.length + parlays.length;
  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0) + parlays.reduce((s, p) => s + p.stake, 0);
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  return (
    <div className="animate-in">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-light text-gradient">dashboard</h1>
        <div className="flex gap-3">
          <Link href="/bets/new" className="btn-ghost text-xs px-5 py-2 rounded-full">new bet</Link>
          <Link href="/parlays/new" className="btn-glow text-xs px-5 py-2 rounded-full">new parlay</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        <StatsCard label="Total Bets" value={totalBets} />
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-success" : "text-danger"} />
        <StatsCard label="Wins" value={wonBets} color="text-success" />
        <StatsCard label="Losses" value={lostBets} color="text-danger" />
        <StatsCard label="Total Profit" value={totalProfit} color={totalProfit >= 0 ? "text-success" : "text-danger"} />
        <StatsCard label="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? "text-success" : "text-danger"} />
      </div>

      <div className="flex gap-8 mb-8">
        {(["bets", "parlays"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-light transition-all duration-300 border-b ${
              tab === t
                ? "border-[rgba(99,102,241,0.5)] text-foreground"
                : "border-transparent text-[rgba(255,255,255,0.25)] hover:text-foreground"
            }`}
          >
            {t} ({t === "bets" ? bets.length : parlays.length})
          </button>
        ))}
      </div>

      {tab === "bets" ? (
        <div className="grid md:grid-cols-2 gap-4">
          {bets.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.25)] col-span-2 text-center py-16 text-sm font-light">
              no bets yet.{" "}
              <Link href="/bets/new" className="text-foreground hover:opacity-70">place your first bet</Link>
            </p>
          ) : bets.map((bet) => <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {parlays.length === 0 ? (
            <p className="text-[rgba(255,255,255,0.25)] text-center py-16 text-sm font-light">
              no parlays yet.{" "}
              <Link href="/parlays/new" className="text-foreground hover:opacity-70">create your first parlay</Link>
            </p>
          ) : parlays.map((parlay) => <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />)}
        </div>
      )}
    </div>
  );
}
