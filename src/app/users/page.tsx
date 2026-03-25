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
      <h1 className="text-3xl font-bold mb-6">Find Bettors</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name..."
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-green-500"
      />

      <div className="space-y-3">
        {users
          .filter((u) => u.id !== userId)
          .map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between"
            >
              <div>
                <Link href={`/profile/${user.id}`} className="font-bold text-lg hover:text-green-600">
                  {user.name}
                </Link>
                {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <span>{user._count.bets} bets</span>
                  <span>{user._count.followers} followers</span>
                  <span>{user._count.following} following</span>
                </div>
              </div>
              <button
                onClick={() => toggleFollow(user.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  followingIds.has(user.id)
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {followingIds.has(user.id) ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}
