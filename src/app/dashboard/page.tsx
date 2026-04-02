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

  if (status === "loading") return <div className="text-xs text-[#aaa] py-20">...</div>;
  if (!session) return null;

  const totalBets = bets.length + parlays.length;
  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0) + parlays.reduce((s, p) => s + p.stake, 0);
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-sm">dashboard</h1>
        <div className="flex gap-4 text-xs text-[#aaa]">
          <Link href="/bets/new" className="hover:text-[#111] transition-colors">
            + bet
          </Link>
          <Link href="/parlays/new" className="hover:text-[#111] transition-colors">
            + parlay
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-12">
        <StatsCard label="Total" value={totalBets} />
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="flex gap-6 mb-8 text-xs">
        <button
          onClick={() => setTab("bets")}
          className={`pb-1 ${tab === "bets" ? "text-[#111] border-b border-[#111]" : "text-[#aaa] hover:text-[#111]"} transition-colors`}
        >
          bets ({bets.length})
        </button>
        <button
          onClick={() => setTab("parlays")}
          className={`pb-1 ${tab === "parlays" ? "text-[#111] border-b border-[#111]" : "text-[#aaa] hover:text-[#111]"} transition-colors`}
        >
          parlays ({parlays.length})
        </button>
      </div>

      {tab === "bets" ? (
        <div>
          {bets.length === 0 ? (
            <p className="text-xs text-[#aaa] py-12">
              no bets yet.{" "}
              <Link href="/bets/new" className="text-[#111] underline underline-offset-2 hover:no-underline">
                place your first
              </Link>
            </p>
          ) : (
            bets.map((bet) => (
              <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />
            ))
          )}
        </div>
      ) : (
        <div>
          {parlays.length === 0 ? (
            <p className="text-xs text-[#aaa] py-12">
              no parlays yet.{" "}
              <Link href="/parlays/new" className="text-[#111] underline underline-offset-2 hover:no-underline">
                create your first
              </Link>
            </p>
          ) : (
            parlays.map((parlay) => (
              <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
