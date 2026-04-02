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
    <div>
      <h1 className="text-sm mb-8">people</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="search..."
        className="w-full border-b bg-transparent pb-2 text-xs mb-10 focus:border-[#111]"
      />

      <div className="space-y-0">
        {users
          .filter((u) => u.id !== userId)
          .map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between border-b py-4"
            >
              <div>
                <Link href={`/profile/${user.id}`} className="text-xs hover:underline">
                  {user.name}
                </Link>
                {user.bio && <p className="text-[10px] text-[#aaa] mt-0.5">{user.bio}</p>}
                <div className="flex gap-4 text-[10px] text-[#ccc] mt-1">
                  <span>{user._count.bets} bets</span>
                  <span>{user._count.followers} followers</span>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`text-[10px] transition-colors ${
                  followingIds.has(user.id)
                    ? "text-[#ccc] hover:text-[#111]"
                    : "text-[#111] underline underline-offset-2 hover:no-underline"
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
