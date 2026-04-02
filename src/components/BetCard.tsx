"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatOdds, formatMoney, betTypeLabel } from "@/lib/utils";
import { useState } from "react";

interface BetCardProps {
  bet: {
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
  };
  showUser?: boolean;
  onUpdate?: () => void;
}

const resultLabel = (r: string) => {
  if (r === "WON") return "w";
  if (r === "LOST") return "l";
  if (r === "PUSH") return "p";
  if (r === "VOID") return "v";
  return "...";
};

export default function BetCard({ bet, showUser = true, onUpdate }: BetCardProps) {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const [liked, setLiked] = useState(bet.likes.some((l) => l.userId === userId));
  const [likeCount, setLikeCount] = useState(bet.likes.length);

  const toggleLike = async () => {
    const res = await fetch("/api/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ betId: bet.id }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount((c) => (data.liked ? c + 1 : c - 1));
  };

  const updateResult = async (result: string) => {
    await fetch(`/api/bets/${bet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
    });
    onUpdate?.();
  };

  return (
    <div className="border-b pb-5 mb-5 last:border-0">
      <div className="flex justify-between items-start mb-2">
        <div className="space-y-0.5">
          {showUser && (
            <Link href={`/profile/${bet.user.id}`} className="text-[10px] text-[#aaa] hover:text-[#111] transition-colors">
              {bet.user.name}
            </Link>
          )}
          <h3 className="text-xs">{bet.eventName}</h3>
          <div className="flex gap-3 text-[10px] text-[#aaa]">
            <span>{bet.sport.toLowerCase()}</span>
            <span>{betTypeLabel(bet.betType).toLowerCase()}</span>
            {bet.isLive && <span>live</span>}
          </div>
        </div>
        <span className={`text-[10px] ${bet.result === "WON" ? "text-[#111]" : bet.result === "LOST" ? "text-[#ccc]" : "text-[#aaa]"}`}>
          {resultLabel(bet.result)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px] text-[#666] mb-2">
        <div>
          <span className="text-[#aaa]">pick </span>
          {bet.selection}
          {bet.line != null && <span className="text-[#aaa]"> ({bet.line > 0 ? "+" : ""}{bet.line})</span>}
        </div>
        <div>
          <span className="text-[#aaa]">odds </span>
          {formatOdds(bet.odds)}
        </div>
        <div>
          <span className="text-[#aaa]">stake </span>
          {formatMoney(bet.stake)}
        </div>
        <div>
          <span className="text-[#aaa]">to win </span>
          {formatMoney(bet.potentialPayout - bet.stake)}
        </div>
      </div>

      {bet.profit != null && (
        <div className={`text-[11px] mb-2 ${bet.profit >= 0 ? "text-[#111]" : "text-[#aaa]"}`}>
          p/l {bet.profit >= 0 ? "+" : ""}{formatMoney(bet.profit)}
        </div>
      )}

      {bet.notes && <p className="text-[10px] text-[#aaa] italic mb-2">{bet.notes}</p>}

      <div className="flex items-center justify-between text-[10px] text-[#ccc]">
        <div className="flex items-center gap-4">
          {session && (
            <button onClick={toggleLike} className={`hover:text-[#111] transition-colors ${liked ? "text-[#111]" : ""}`}>
              {liked ? "+" : "+"}{likeCount > 0 ? ` ${likeCount}` : ""}
            </button>
          )}
          <span>{new Date(bet.eventDate).toLocaleDateString()}</span>
        </div>

        {userId === bet.user.id && bet.result === "PENDING" && (
          <div className="flex gap-3">
            <button onClick={() => updateResult("WON")} className="hover:text-[#111] transition-colors">won</button>
            <button onClick={() => updateResult("LOST")} className="hover:text-[#111] transition-colors">lost</button>
            <button onClick={() => updateResult("PUSH")} className="hover:text-[#111] transition-colors">push</button>
          </div>
        )}
      </div>
    </div>
  );
}
