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

  if (status === "loading") return <div className="text-center py-20">Loading...</div>;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/bets/new" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            New Bet
          </Link>
          <Link href="/parlays/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
            New Parlay
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatsCard label="Total Bets" value={totalBets} />
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Total Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setTab("bets")}
          className={`pb-2 px-1 font-medium ${tab === "bets" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
        >
          Single Bets ({bets.length})
        </button>
        <button
          onClick={() => setTab("parlays")}
          className={`pb-2 px-1 font-medium ${tab === "parlays" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
        >
          Parlays ({parlays.length})
        </button>
      </div>

      {tab === "bets" ? (
        <div className="grid md:grid-cols-2 gap-4">
          {bets.length === 0 ? (
            <p className="text-gray-500 col-span-2 text-center py-10">
              No bets yet.{" "}
              <Link href="/bets/new" className="text-green-600 hover:underline">
                Place your first bet!
              </Link>
            </p>
          ) : (
            bets.map((bet) => (
              <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {parlays.length === 0 ? (
            <p className="text-gray-500 text-center py-10">
              No parlays yet.{" "}
              <Link href="/parlays/new" className="text-green-600 hover:underline">
                Create your first parlay!
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
