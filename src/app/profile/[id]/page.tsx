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

  if (!user) return <div className="text-center py-20">Loading...</div>;

  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.bio && <p className="text-gray-600 mt-1">{user.bio}</p>}
            <div className="flex gap-6 mt-3 text-sm text-gray-500">
              <span><strong className="text-gray-900">{user._count.followers}</strong> followers</span>
              <span><strong className="text-gray-900">{user._count.following}</strong> following</span>
              <span><strong className="text-gray-900">{user._count.bets}</strong> bets</span>
              <span><strong className="text-gray-900">{user._count.parlays}</strong> parlays</span>
            </div>
          </div>
          {myId && myId !== id && (
            <button
              onClick={toggleFollow}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                isFollowing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Total Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setTab("bets")}
          className={`pb-2 px-1 font-medium ${tab === "bets" ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"}`}
        >
          Bets ({bets.length})
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
          {bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />
          ))}
          {bets.length === 0 && <p className="text-gray-500 col-span-2 text-center py-10">No bets yet.</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {parlays.map((parlay) => (
            <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />
          ))}
          {parlays.length === 0 && <p className="text-gray-500 text-center py-10">No parlays yet.</p>}
        </div>
      )}
    </div>
  );
}
