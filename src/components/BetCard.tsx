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

  const resultStyle =
    bet.result === "WON" ? "bg-[#1a2e1a] text-[#4ade80]" :
    bet.result === "LOST" ? "bg-[#2e1a1a] text-[#f87171]" :
    bet.result === "PUSH" ? "bg-[#2e2a1a] text-[#facc15]" :
    "bg-[#1a1a1a] text-[#555]";

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${bet.user.id}`} className="text-[12px] text-[#555] hover:text-[#888] transition-colors">
              {bet.user.name}
            </Link>
          )}
          <h3 className="text-[15px] font-medium text-white">{bet.eventName}</h3>
          <div className="flex gap-2 mt-1.5">
            <span className="text-[11px] text-[#555] bg-[#222] px-2.5 py-0.5 rounded-full">{bet.sport}</span>
            <span className="text-[11px] text-[#555] bg-[#222] px-2.5 py-0.5 rounded-full">{betTypeLabel(bet.betType)}</span>
            {bet.isLive && (
              <span className="text-[11px] text-[#f87171] bg-[#2e1a1a] px-2.5 py-0.5 rounded-full">LIVE</span>
            )}
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${resultStyle}`}>
          {bet.result}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[13px] mb-3">
        <div>
          <span className="text-[#555]">Pick </span>
          <span className="text-white">{bet.selection}</span>
          {bet.line != null && <span className="text-[#555]"> ({bet.line > 0 ? "+" : ""}{bet.line})</span>}
        </div>
        <div>
          <span className="text-[#555]">Odds </span>
          <span className="text-white">{formatOdds(bet.odds)}</span>
        </div>
        <div>
          <span className="text-[#555]">Stake </span>
          <span className="text-white">{formatMoney(bet.stake)}</span>
        </div>
        <div>
          <span className="text-[#555]">To Win </span>
          <span className="text-white">{formatMoney(bet.potentialPayout - bet.stake)}</span>
        </div>
      </div>

      {bet.profit != null && (
        <div className={`text-[13px] font-medium mb-2 ${bet.profit >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
          P/L {bet.profit >= 0 ? "+" : ""}{formatMoney(bet.profit)}
        </div>
      )}

      {bet.notes && <p className="text-[12px] text-[#555] italic mb-3">{bet.notes}</p>}

      <div className="flex items-center justify-between pt-3 border-t border-[#222]">
        <div className="flex items-center gap-4 text-[12px] text-[#555]">
          {session && (
            <button onClick={toggleLike} className={`hover:text-white transition-colors ${liked ? "text-white" : ""}`}>
              {liked ? "\u2764" : "\u2661"} {likeCount > 0 && likeCount}
            </button>
          )}
          <span>{new Date(bet.eventDate).toLocaleDateString()}</span>
        </div>

        {userId === bet.user.id && bet.result === "PENDING" && (
          <div className="flex gap-1.5">
            <button onClick={() => updateResult("WON")} className="text-[11px] text-[#555] hover:text-[#4ade80] bg-[#222] hover:bg-[#1a2e1a] px-3 py-1 rounded-full transition-all">Won</button>
            <button onClick={() => updateResult("LOST")} className="text-[11px] text-[#555] hover:text-[#f87171] bg-[#222] hover:bg-[#2e1a1a] px-3 py-1 rounded-full transition-all">Lost</button>
            <button onClick={() => updateResult("PUSH")} className="text-[11px] text-[#555] hover:text-[#facc15] bg-[#222] hover:bg-[#2e2a1a] px-3 py-1 rounded-full transition-all">Push</button>
          </div>
        )}
      </div>
    </div>
  );
}
