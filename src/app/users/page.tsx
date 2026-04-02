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
      <h1 className="text-xl font-semibold mb-6">People</h1>

      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="w-full bg-[#1a1a1a] rounded-full pl-11 pr-4 py-3 text-[14px] border border-transparent focus:border-[#333]"
        />
      </div>

      <div className="space-y-2">
        {users
          .filter((u) => u.id !== userId)
          .map((user) => (
            <div key={user.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-2xl p-4">
              <div>
                <Link href={`/profile/${user.id}`} className="text-[14px] font-medium text-white hover:text-[#ccc] transition-colors">
                  {user.name}
                </Link>
                {user.bio && <p className="text-[12px] text-[#555] mt-0.5">{user.bio}</p>}
                <div className="flex gap-4 text-[11px] text-[#444] mt-1">
                  <span>{user._count.bets} bets</span>
                  <span>{user._count.followers} followers</span>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-1.5 text-[12px] rounded-full transition-all ${
                  followingIds.has(user.id)
                    ? "text-[#555] bg-[#222] hover:bg-[#2a2a2a]"
                    : "text-white bg-[#333] hover:bg-[#444]"
                }`}
              >
                {followingIds.has(user.id) ? "Following" : "Follow"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
