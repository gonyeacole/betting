"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import BetCard from "@/components/BetCard";
import ParlayCard from "@/components/ParlayCard";

type FeedItem =
  | ({ _type: "bet" } & {
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
    })
  | ({ _type: "parlay" } & {
      id: string;
      name?: string | null;
      totalOdds: number;
      stake: number;
      potentialPayout: number;
      isSameGame: boolean;
      result: string;
      createdAt: string;
      user: { id: string; name: string; image?: string | null };
      legs: {
        id: string;
        sport: string;
        eventName: string;
        betType: string;
        selection: string;
        odds: number;
        line?: number | null;
        result: string;
      }[];
    });

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    const res = await fetch("/api/feed");
    if (res.ok) setFeed(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchFeed();
  }, [status, router, fetchFeed]);

  if (status === "loading" || loading) return <div className="text-center py-20 text-muted">loading...</div>;
  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">feed</h1>

      {feed.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <p className="text-muted mb-4 text-sm">your feed is empty. follow some bettors to see their picks.</p>
          <Link href="/users" className="text-sm text-foreground bg-white/10 hover:bg-white/15 px-5 py-2 rounded-full transition-colors">
            find users
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {feed.map((item) =>
            item._type === "bet" ? (
              <BetCard key={`bet-${item.id}`} bet={item} onUpdate={fetchFeed} />
            ) : (
              <ParlayCard key={`parlay-${item.id}`} parlay={item} />
            )
          )}
        </div>
      )}
    </div>
  );
}
