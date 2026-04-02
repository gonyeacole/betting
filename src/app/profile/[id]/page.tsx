"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, use } from "react";
import BetCard from "@/components/BetCard";
import ParlayCard from "@/components/ParlayCard";
import StatsCard from "@/components/StatsCard";

interface UserProfile {
  id: string; name: string; image?: string | null; bio?: string | null; createdAt: string;
  _count: { bets: number; followers: number; following: number; parlays: number };
}

interface Bet {
  id: string; sport: string; league?: string | null; eventName: string; eventDate: string;
  betType: string; selection: string; odds: number; stake: number; potentialPayout: number;
  line?: number | null; isLive: boolean; result: string; profit?: number | null;
  notes?: string | null; createdAt: string; user: { id: string; name: string; image?: string | null };
  likes: { id: string; userId: string }[];
}

interface Parlay {
  id: string; name?: string | null; totalOdds: number; stake: number; potentialPayout: number;
  isSameGame: boolean; result: string; createdAt: string;
  user: { id: string; name: string; image?: string | null }; legs: Bet[];
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [tab, setTab] = useState<"bets" | "parlays">("bets");

  const myId = (session?.user as { id?: string })?.id;

  const fetchData = useCallback(async () => {
    const [userRes, betsRes, parlaysRes] = await Promise.all([
      fetch(`/api/users/${id}`), fetch(`/api/bets?userId=${id}`), fetch(`/api/parlays?userId=${id}`),
    ]);
    setUser(await userRes.json());
    setBets(await betsRes.json());
    setParlays(await parlaysRes.json());
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (myId) {
      fetch(`/api/follows?userId=${myId}`).then((r) => r.json()).then((data) => {
        setIsFollowing(data.following.some((f: { following: { id: string } }) => f.following.id === id));
      });
    }
  }, [myId, id]);

  const toggleFollow = async () => {
    const res = await fetch("/api/follows", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id }),
    });
    const data = await res.json();
    setIsFollowing(data.following);
    fetchData();
  };

  if (!user) return <div className="text-center py-20 text-[rgba(255,255,255,0.3)] font-light">loading...</div>;

  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

  return (
    <div className="animate-in">
      <div className="glass rounded-4xl p-8 mb-8 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full" />

        <div className="flex justify-between items-start relative">
          <div>
            <h1 className="text-3xl font-light text-gradient">{user.name}</h1>
            {user.bio && <p className="text-[rgba(255,255,255,0.35)] text-sm mt-2 font-light">{user.bio}</p>}
            <div className="flex gap-8 mt-4 text-sm text-[rgba(255,255,255,0.3)]">
              <span><strong className="text-foreground font-medium">{user._count.followers}</strong> followers</span>
              <span><strong className="text-foreground font-medium">{user._count.following}</strong> following</span>
              <span><strong className="text-foreground font-medium">{user._count.bets}</strong> bets</span>
              <span><strong className="text-foreground font-medium">{user._count.parlays}</strong> parlays</span>
            </div>
          </div>
          {myId && myId !== id && (
            <button
              onClick={toggleFollow}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isFollowing ? "btn-ghost" : "btn-glow"
              }`}
            >
              {isFollowing ? "unfollow" : "follow"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-success" : "text-danger"} />
        <StatsCard label="Wins" value={wonBets} color="text-success" />
        <StatsCard label="Losses" value={lostBets} color="text-danger" />
        <StatsCard label="Total Profit" value={totalProfit} color={totalProfit >= 0 ? "text-success" : "text-danger"} />
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
          {bets.map((bet) => <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />)}
          {bets.length === 0 && <p className="text-[rgba(255,255,255,0.25)] col-span-2 text-center py-16 text-sm font-light">no bets yet.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {parlays.map((parlay) => <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />)}
          {parlays.length === 0 && <p className="text-[rgba(255,255,255,0.25)] text-center py-16 text-sm font-light">no parlays yet.</p>}
        </div>
      )}
    </div>
  );
}
