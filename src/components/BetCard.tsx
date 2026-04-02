"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatOdds, formatMoney, resultColor, betTypeLabel } from "@/lib/utils";
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

  return (
    <div className="glass rounded-3xl p-5 group">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${bet.user.id}`} className="text-xs text-[rgba(255,255,255,0.3)] hover:text-foreground transition-all duration-300">
              {bet.user.name}
            </Link>
          )}
          <h3 className="font-medium text-foreground text-sm">{bet.eventName}</h3>
          <div className="flex gap-2 mt-1.5">
            <span className="text-[10px] text-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 rounded-full">{bet.sport}</span>
            <span className="text-[10px] text-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.04)] px-2.5 py-0.5 rounded-full">
              {betTypeLabel(bet.betType)}
            </span>
            {bet.isLive && (
              <span className="text-[10px] text-danger bg-danger/10 px-2.5 py-0.5 rounded-full font-medium">live</span>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${resultColor(bet.result)}`}>
          {bet.result.toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">pick </span>
          <span className="text-foreground font-light">{bet.selection}</span>
          {bet.line != null && <span className="text-[rgba(255,255,255,0.25)] text-xs"> ({bet.line > 0 ? "+" : ""}{bet.line})</span>}
        </div>
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">odds </span>
          <span className="text-foreground font-light">{formatOdds(bet.odds)}</span>
        </div>
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">stake </span>
          <span className="text-foreground font-light">{formatMoney(bet.stake)}</span>
        </div>
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">to win </span>
          <span className="text-foreground font-light">{formatMoney(bet.potentialPayout - bet.stake)}</span>
        </div>
      </div>

      {bet.profit != null && (
        <div className={`text-sm font-light mb-2 ${bet.profit >= 0 ? "text-success" : "text-danger"}`}>
          p/l: {bet.profit >= 0 ? "+" : ""}{formatMoney(bet.profit)}
        </div>
      )}

      {bet.notes && <p className="text-xs text-[rgba(255,255,255,0.25)] mb-3 italic font-light">&quot;{bet.notes}&quot;</p>}

      <div className="divider-gradient my-3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {session && (
            <button onClick={toggleLike} className={`text-xs transition-all duration-300 ${liked ? "text-foreground" : "text-[rgba(255,255,255,0.25)] hover:text-foreground"}`}>
              {liked ? "\u2764" : "\u2661"} {likeCount}
            </button>
          )}
          <span className="text-[10px] text-[rgba(255,255,255,0.2)]">
            {new Date(bet.eventDate).toLocaleDateString()}
          </span>
        </div>

        {userId === bet.user.id && bet.result === "PENDING" && (
          <div className="flex gap-1">
            <button onClick={() => updateResult("WON")} className="text-[10px] text-success bg-success/10 px-3 py-1 rounded-full hover:bg-success/20 transition-all duration-300">won</button>
            <button onClick={() => updateResult("LOST")} className="text-[10px] text-danger bg-danger/10 px-3 py-1 rounded-full hover:bg-danger/20 transition-all duration-300">lost</button>
            <button onClick={() => updateResult("PUSH")} className="text-[10px] text-warning bg-warning/10 px-3 py-1 rounded-full hover:bg-warning/20 transition-all duration-300">push</button>
          </div>
        )}
      </div>
    </div>
  );
}
