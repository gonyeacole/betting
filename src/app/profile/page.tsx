"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import BetCard from "@/components/BetCard";
import ParlayCard from "@/components/ParlayCard";
import StatsCard from "@/components/StatsCard";

interface UserProfile {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  _count: { bets: number; followers: number; following: number; parlays: number };
}

interface FollowUser {
  id: string;
  name: string;
  image?: string | null;
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [parlays, setParlays] = useState<Parlay[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImage, setEditImage] = useState("");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<FollowUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"bets" | "parlays">("bets");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDefaultUser = async () => {
      try {
        const res = await fetch("/api/users");
        const users = await res.json();
        if (users.length > 0) setUserId(users[0].id);
      } catch {}
    };
    fetchDefaultUser();
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      const [profileRes, betsRes, parlaysRes, followsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/bets?userId=${userId}`),
        fetch(`/api/parlays?userId=${userId}`),
        fetch(`/api/follows?userId=${userId}`),
      ]);
      setProfile(await profileRes.json());
      setBets(await betsRes.json());
      setParlays(await parlaysRes.json());
      const followsData = await followsRes.json();
      setFollowersList(followsData.followers?.map((f: { follower: FollowUser }) => f.follower) || []);
      setFollowingList(followsData.following?.map((f: { following: FollowUser }) => f.following) || []);
    } catch {}
  }, [userId]);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditBio(profile?.bio || "");
    setEditImage(profile?.image || "");
    setEditing(true);
  };

  const saveProfile = async () => {
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, bio: editBio, image: editImage }),
    });
    setEditing(false);
    fetchData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const totalBets = bets.length + parlays.length;
  const wonBets = bets.filter((b) => b.result === "WON").length;
  const lostBets = bets.filter((b) => b.result === "LOST").length;
  const totalStaked = bets.reduce((s, b) => s + b.stake, 0) + parlays.reduce((s, p) => s + p.stake, 0);
  const totalProfit = bets.reduce((s, b) => s + (b.profit || 0), 0);
  const winRate = wonBets + lostBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0;
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0;

  return (
    <div className="animate-fade-in-up">
      {/* Profile Header */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 mb-6 card-hover">
        {editing ? (
          <div className="space-y-4 animate-scale-in">
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#333] hover:border-[#555] avatar-glow"
              >
                {editImage ? (
                  <img src={editImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#555] text-[11px]">+ Photo</span>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 bg-[#111] rounded-xl px-4 py-2.5 text-[14px] border border-[#2a2a2a]"
                placeholder="Name"
              />
            </div>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full bg-[#111] rounded-xl px-4 py-2.5 text-[14px] border border-[#2a2a2a] resize-none"
              placeholder="Bio"
              rows={2}
            />
            <div className="flex gap-2">
              <button onClick={saveProfile} className="px-4 py-1.5 text-[12px] text-white bg-[#333] hover:bg-[#444] rounded-full pill-press">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-1.5 text-[12px] text-[#555] hover:text-[#888] rounded-full pill-press">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex-shrink-0 flex items-center justify-center overflow-hidden avatar-glow">
              {profile?.image ? (
                <img src={profile.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#555] text-lg font-semibold">{profile?.name?.[0]?.toUpperCase() || "?"}</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold">{profile?.name || "Your Profile"}</h1>
                  {profile?.bio && <p className="text-[13px] text-[#888] mt-1">{profile.bio}</p>}
                </div>
                {profile && (
                  <button onClick={startEditing} className="px-4 py-1.5 text-[12px] text-[#555] bg-[#222] hover:bg-[#2a2a2a] rounded-full pill-press">Edit</button>
                )}
              </div>
              <div className="flex gap-5 mt-3 text-[12px] text-[#555]">
                <button onClick={() => { setShowFollowers(!showFollowers); setShowFollowing(false); }} className="hover:text-[#888] transition-colors">
                  <span className="text-white font-medium">{profile?._count.followers || 0}</span> followers
                </button>
                <button onClick={() => { setShowFollowing(!showFollowing); setShowFollowers(false); }} className="hover:text-[#888] transition-colors">
                  <span className="text-white font-medium">{profile?._count.following || 0}</span> following
                </button>
                <span><span className="text-white font-medium">{profile?._count.bets || 0}</span> bets</span>
              </div>
            </div>
          </div>
        )}

        {showFollowers && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] animate-slide-down">
            <p className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Followers</p>
            {followersList.length === 0 ? (
              <p className="text-[13px] text-[#555]">No followers yet</p>
            ) : (
              <div className="space-y-2">
                {followersList.map((u) => (
                  <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 py-1.5 hover:bg-[#222] rounded-xl px-2 -mx-2 transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                      {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[#555] text-xs">{u.name[0]}</span>}
                    </div>
                    <span className="text-[13px]">{u.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {showFollowing && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] animate-slide-down">
            <p className="text-[12px] text-[#555] uppercase tracking-wider mb-3">Following</p>
            {followingList.length === 0 ? (
              <p className="text-[13px] text-[#555]">Not following anyone</p>
            ) : (
              <div className="space-y-2">
                {followingList.map((u) => (
                  <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-3 py-1.5 hover:bg-[#222] rounded-xl px-2 -mx-2 transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                      {u.image ? <img src={u.image} alt="" className="w-full h-full object-cover" /> : <span className="text-[#555] text-xs">{u.name[0]}</span>}
                    </div>
                    <span className="text-[13px]">{u.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6 stagger-children">
        <StatsCard label="Total" value={totalBets} />
        <StatsCard label="Win Rate" value={`${winRate.toFixed(1)}%`} color={winRate >= 50 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="Wins" value={wonBets} color="text-green-600" />
        <StatsCard label="Losses" value={lostBets} color="text-red-600" />
        <StatsCard label="Profit" value={totalProfit} color={totalProfit >= 0 ? "text-green-600" : "text-red-600"} />
        <StatsCard label="ROI" value={`${roi.toFixed(1)}%`} color={roi >= 0 ? "text-green-600" : "text-red-600"} />
      </div>

      {/* Bets/Parlays Tabs */}
      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => setTab("bets")} className={`px-4 py-1.5 text-[13px] rounded-full pill-press ${tab === "bets" ? "bg-[#1a1a1a] text-white tab-active" : "text-[#555]"}`}>
          Bets ({bets.length})
        </button>
        <button onClick={() => setTab("parlays")} className={`px-4 py-1.5 text-[13px] rounded-full pill-press ${tab === "parlays" ? "bg-[#1a1a1a] text-white tab-active" : "text-[#555]"}`}>
          Parlays ({parlays.length})
        </button>
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Link href="/bets/new" className="px-4 py-1.5 text-[13px] text-[#888] bg-[#1a1a1a] hover:bg-[#222] rounded-full pill-press">+ Bet</Link>
        <Link href="/parlays/new" className="px-4 py-1.5 text-[13px] text-[#888] bg-[#1a1a1a] hover:bg-[#222] rounded-full pill-press">+ Parlay</Link>
      </div>

      {tab === "bets" ? (
        bets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#555] mb-4">No bets yet</p>
            <Link href="/bets/new" className="text-[13px] text-[#888] hover:text-white transition-colors">Place your first bet</Link>
          </div>
        ) : (
          bets.map((bet) => <BetCard key={bet.id} bet={bet} showUser={false} onUpdate={fetchData} />)
        )
      ) : (
        parlays.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[14px] text-[#555] mb-4">No parlays yet</p>
            <Link href="/parlays/new" className="text-[13px] text-[#888] hover:text-white transition-colors">Create your first parlay</Link>
          </div>
        ) : (
          parlays.map((parlay) => <ParlayCard key={parlay.id} parlay={parlay} showUser={false} />)
        )
      )}
    </div>
  );
}
