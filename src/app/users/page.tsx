"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserResult {
  id: string;
  name: string;
  image?: string | null;
  bio?: string | null;
  _count: { bets: number; followers: number; following: number };
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserResult[]>([]);
  const [search, setSearch] = useState("");
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const userId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    fetch(`/api/users?search=${search}`)
      .then((r) => r.json())
      .then(setUsers);
  }, [search]);

  useEffect(() => {
    if (userId) {
      fetch(`/api/follows?userId=${userId}`)
        .then((r) => r.json())
        .then((data) => {
          setFollowingIds(new Set(data.following.map((f: { following: { id: string } }) => f.following.id)));
        });
    }
  }, [userId]);

  const toggleFollow = async (targetId: string) => {
    const res = await fetch("/api/follows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followingId: targetId }),
    });
    const data = await res.json();
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (data.following) next.add(targetId);
      else next.delete(targetId);
      return next;
    });
  };

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">find bettors</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search by name..."
        className="w-full bg-card border border-border rounded-xl px-4 py-3 mb-6 text-sm text-foreground placeholder:text-subtle focus:outline-none focus:border-subtle transition-colors"
      />

      <div className="space-y-3">
        {users
          .filter((u) => u.id !== userId)
          .map((user) => (
            <div
              key={user.id}
              className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between hover:border-subtle transition-colors"
            >
              <div>
                <Link href={`/profile/${user.id}`} className="font-medium text-foreground hover:opacity-70 transition-opacity">
                  {user.name}
                </Link>
                {user.bio && <p className="text-sm text-muted mt-0.5">{user.bio}</p>}
                <div className="flex gap-4 text-xs text-muted mt-2">
                  <span>{user._count.bets} bets</span>
                  <span>{user._count.followers} followers</span>
                  <span>{user._count.following} following</span>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  followingIds.has(user.id)
                    ? "bg-white/5 text-muted hover:text-foreground border border-border"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                {followingIds.has(user.id) ? "unfollow" : "follow"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
