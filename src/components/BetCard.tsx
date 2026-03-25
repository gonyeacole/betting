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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${bet.user.id}`} className="text-sm font-medium text-gray-600 hover:text-green-600">
              {bet.user.name}
            </Link>
          )}
          <h3 className="font-bold text-lg text-gray-900">{bet.eventName}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{bet.sport}</span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              {betTypeLabel(bet.betType)}
            </span>
            {bet.isLive && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">LIVE</span>
            )}
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${resultColor(bet.result)}`}>
          {bet.result}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="text-gray-500">Pick:</span>{" "}
          <span className="font-semibold">{bet.selection}</span>
          {bet.line != null && <span className="text-gray-500"> ({bet.line > 0 ? "+" : ""}{bet.line})</span>}
        </div>
        <div>
          <span className="text-gray-500">Odds:</span>{" "}
          <span className="font-semibold">{formatOdds(bet.odds)}</span>
        </div>
        <div>
          <span className="text-gray-500">Stake:</span>{" "}
          <span className="font-semibold">{formatMoney(bet.stake)}</span>
        </div>
        <div>
          <span className="text-gray-500">To Win:</span>{" "}
          <span className="font-semibold text-green-600">{formatMoney(bet.potentialPayout - bet.stake)}</span>
        </div>
      </div>

      {bet.profit != null && (
        <div className={`text-sm font-bold mb-2 ${bet.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
          P/L: {bet.profit >= 0 ? "+" : ""}{formatMoney(bet.profit)}
        </div>
      )}

      {bet.notes && <p className="text-sm text-gray-500 mb-3 italic">&quot;{bet.notes}&quot;</p>}

      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center gap-3">
          {session && (
            <button onClick={toggleLike} className={`text-sm flex items-center gap-1 ${liked ? "text-red-500" : "text-gray-400"} hover:text-red-500 transition`}>
              {liked ? "\u2764" : "\u2661"} {likeCount}
            </button>
          )}
          <span className="text-xs text-gray-400">
            {new Date(bet.eventDate).toLocaleDateString()}
          </span>
        </div>

        {userId === bet.user.id && bet.result === "PENDING" && (
          <div className="flex gap-1">
            <button onClick={() => updateResult("WON")} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Won</button>
            <button onClick={() => updateResult("LOST")} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Lost</button>
            <button onClick={() => updateResult("PUSH")} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">Push</button>
          </div>
        )}
      </div>
    </div>
  );
}
