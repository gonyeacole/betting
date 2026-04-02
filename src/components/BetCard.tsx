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
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-subtle transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${bet.user.id}`} className="text-sm text-muted hover:text-foreground transition-colors">
              {bet.user.name}
            </Link>
          )}
          <h3 className="font-medium text-foreground">{bet.eventName}</h3>
          <div className="flex gap-2 mt-1.5">
            <span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded-full">{bet.sport}</span>
            <span className="text-xs text-muted bg-white/5 px-2 py-0.5 rounded-full">
              {betTypeLabel(bet.betType)}
            </span>
            {bet.isLive && (
              <span className="text-xs text-danger bg-danger/10 px-2 py-0.5 rounded-full font-medium">live</span>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${resultColor(bet.result)}`}>
          {bet.result.toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-muted">pick </span>
          <span className="text-foreground font-medium">{bet.selection}</span>
          {bet.line != null && <span className="text-muted"> ({bet.line > 0 ? "+" : ""}{bet.line})</span>}
        </div>
        <div>
          <span className="text-muted">odds </span>
          <span className="text-foreground font-medium">{formatOdds(bet.odds)}</span>
        </div>
        <div>
          <span className="text-muted">stake </span>
          <span className="text-foreground font-medium">{formatMoney(bet.stake)}</span>
        </div>
        <div>
          <span className="text-muted">to win </span>
          <span className="text-foreground font-medium">{formatMoney(bet.potentialPayout - bet.stake)}</span>
        </div>
      </div>

      {bet.profit != null && (
        <div className={`text-sm font-medium mb-2 ${bet.profit >= 0 ? "text-success" : "text-danger"}`}>
          p/l: {bet.profit >= 0 ? "+" : ""}{formatMoney(bet.profit)}
        </div>
      )}

      {bet.notes && <p className="text-sm text-muted mb-3 italic">&quot;{bet.notes}&quot;</p>}

      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-3">
          {session && (
            <button onClick={toggleLike} className={`text-sm transition-colors ${liked ? "text-foreground" : "text-muted hover:text-foreground"}`}>
              {liked ? "\u2764" : "\u2661"} {likeCount}
            </button>
          )}
          <span className="text-xs text-muted">
            {new Date(bet.eventDate).toLocaleDateString()}
          </span>
        </div>

        {userId === bet.user.id && bet.result === "PENDING" && (
          <div className="flex gap-1">
            <button onClick={() => updateResult("WON")} className="text-xs text-success bg-success/10 px-2.5 py-1 rounded-full hover:bg-success/20 transition-colors">won</button>
            <button onClick={() => updateResult("LOST")} className="text-xs text-danger bg-danger/10 px-2.5 py-1 rounded-full hover:bg-danger/20 transition-colors">lost</button>
            <button onClick={() => updateResult("PUSH")} className="text-xs text-warning bg-warning/10 px-2.5 py-1 rounded-full hover:bg-warning/20 transition-colors">push</button>
          </div>
        )}
      </div>
    </div>
  );
}
