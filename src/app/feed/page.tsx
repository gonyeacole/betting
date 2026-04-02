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

  if (status === "loading" || loading) return <div className="text-xs text-[#aaa] py-20">...</div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-sm mb-10">feed</h1>

      {feed.length === 0 ? (
        <div className="py-16">
          <p className="text-xs text-[#aaa] mb-4">your feed is empty. follow some bettors to see their picks.</p>
          <Link href="/users" className="text-xs text-[#111] underline underline-offset-4 hover:no-underline">
            find people
          </Link>
        </div>
      ) : (
        <div>
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
