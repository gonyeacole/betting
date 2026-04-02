"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, use } from "react";
import BetCard from "@/components/BetCard";
import ParlayCard from "@/components/ParlayCard";
import StatsCard from "@/components/StatsCard";

interface UserProfile {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  createdAt: string;
  _count: { bets: number; followers: number; following: number; parlays: number };
}

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
      fetch(`/api/users/${id}`),
      fetch(`/api/bets?userId=${id}`),
      fetch(`/api/parlays?userId=${id}`),
    ]);
    setUser(await userRes.json());
    setBets(await betsRes.json());
    setParlays(await parlaysRes.json());
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (myId) {
      fetch(`/api/follows?userId=${myId}`)
        .then((r) => r.json())
        .then((data) => {
          setIsFollowing(data.following.some((f: { following: { id: string } }) => f.following.id === id));
        });
    }
  }, [myId, id]);

  const toggleFollow = async () => {
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: id }),
    });
    const data = await res.json();
    setIsFollowing(data.following);
    fetchData();
  };

  if (!user) return <div className="text-[14px] text-[#555] py-20 text-center">...</div>;

  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

  return (
    <div>
      <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold">{user.name}</h1>
            {user.bio && <p className="text-[13px] text-[#888] mt-1">{user.bio}</p>}
            <div className="flex gap-5 mt-3 text-[12px] text-[#555]">
              <span><span className="text-white font-medium">{user._count.followers}</span> followers</span>
              <span><span className="text-white font-medium">{user._count.following}</span> following</span>
              <span><span className="text-white font-medium">{user._count.bets}</span> bets</span>
              <span><span className="text-white font-medium">{user._count.parlays}</span> parlays</span>
            </div>
          </div>
          {myId && myId !== id && (
            <button
              onClick={toggleFollow}
              className={`px-5 py-1.5 text-[12px] rounded-full transition-all ${
                isFollowing
                  ? "text-[#555] bg-[#222] hover:bg-[#2a2a2a]"
                  : "text-white bg-[#333] hover:bg-[#444]"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("bets")}
          className={`px-4 py-1.5 text-[13px] rounded-full transition-all ${
            tab === "bets" ? "bg-[#1a1a1a] text-white" : "text-[#555] hover:text-[#888]"
          }`}
        >
          Bets ({bets.length})
        </button>
        <button
          onClick={() => setTab("parlays")}
          className={`px-4 py-1.5 text-[13px] rounded-full transition-all ${
            tab === "parlays" ? "bg-[#1a1a1a] text-white" : "text-[#555] hover:text-[#888]"
          }`}
        >
          Parlays ({parlays.length})
        </button>
      </div>

      {tab === "bets" ? (
        <div>
          {bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />
          ))}
          {bets.length === 0 && <p className="text-[14px] text-[#555] text-center py-16">No bets yet</p>}
        </div>
      ) : (
        <div>
          {parlays.map((parlay) => (
            <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />
          ))}
          {parlays.length === 0 && <p className="text-[14px] text-[#555] text-center py-16">No parlays yet</p>}
        </div>
      )}
    </div>
  );
}
