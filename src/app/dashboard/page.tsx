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
  const [tab, setTab] = useState<"today" | "upcoming" | "futures">("today");

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

  if (status === "loading") return <div className="text-[14px] text-[#555] py-20 text-center">...</div>;
  if (!session) return null;

  const totalBets = bets.length + parlays.length;
  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0) + parlays.reduce((s, p) => s + p.stake, 0);
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
  const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filterByDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (tab === "today") return d >= todayStart && d < todayEnd;
    if (tab === "upcoming") return d >= todayEnd && d < weekEnd;
    return d >= weekEnd; // futures
  };

  const filteredBets = bets.filter((b) => filterByDate(b.eventDate));
  const filteredParlays = parlays.filter((p) => p.legs?.length > 0 && filterByDate(p.legs[0].eventDate));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/bets/new" className="px-4 py-1.5 text-[13px] text-[#888] bg-[#1a1a1a] hover:bg-[#222] rounded-full transition-all">
            + Bet
          </Link>
          <Link href="/parlays/new" className="px-4 py-1.5 text-[13px] text-[#888] bg-[#1a1a1a] hover:bg-[#222] rounded-full transition-all">
            + Parlay
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
        <StatsCard label="Total" value={totalBets} />
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {(["today", "upcoming", "futures"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-[13px] rounded-full transition-all capitalize ${
              tab === t ? "bg-[#1a1a1a] text-white" : "text-[#555] hover:text-[#888]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {filteredBets.length === 0 && filteredParlays.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#555] mb-4">No {tab} games</p>
            <Link href="/bets/new" className="text-[13px] text-[#888] hover:text-white transition-colors">
              Place a bet
            </Link>
          </div>
        ) : (
          <>
            {filteredBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />
            ))}
            {filteredParlays.map((parlay) => (
              <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
