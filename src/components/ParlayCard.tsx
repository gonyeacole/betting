"use client";

import Link from "next/link";
import { formatOdds, formatMoney, betTypeLabel } from "@/lib/utils";

interface ParlayCardProps {
  parlay: {
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
  };
  showUser?: boolean;
}

export default function ParlayCard({ parlay, showUser = true }: ParlayCardProps) {
  const resultStyle =
    parlay.result === "WON" ? "bg-[#1a2e1a] text-[#4ade80]" :
    parlay.result === "LOST" ? "bg-[#2e1a1a] text-[#f87171]" :
    parlay.result === "PUSH" ? "bg-[#2e2a1a] text-[#facc15]" :
    "bg-[#222] text-[#555]";

  const legResult = (r: string) =>
    r === "WON" ? "text-[#4ade80]" :
    r === "LOST" ? "text-[#f87171]" :
    r === "PUSH" ? "text-[#facc15]" :
    "text-[#555]";

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-5 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${parlay.user.id}`} className="text-[12px] text-[#555] hover:text-[#888] transition-colors">
              {parlay.user.name}
            </Link>
          )}
          <h3 className="text-[15px] font-medium text-white">
            {parlay.isSameGame ? "Same Game Parlay" : "Parlay"} &middot; {parlay.legs.length} legs
          </h3>
          {parlay.name && <p className="text-[12px] text-[#555] mt-0.5">{parlay.name}</p>}
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${resultStyle}`}>
          {parlay.result}
        </span>
      </div>

      <div className="space-y-1 mb-4">
        {parlay.legs.map((leg) => (
          <div key={leg.id} className="flex items-center justify-between bg-[#111] rounded-xl px-3 py-2 text-[13px]">
            <div className="text-[#888]">
              {leg.eventName}
              <span className="text-[#444] ml-2">{betTypeLabel(leg.betType)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white">{leg.selection}</span>
              {leg.line != null && <span className="text-[#555]">({leg.line > 0 ? "+" : ""}{leg.line})</span>}
              <span className="text-[#555]">{formatOdds(leg.odds)}</span>
              <span className={`text-[11px] font-medium ${legResult(leg.result)}`}>
                {leg.result}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 text-[13px] pt-3 border-t border-[#222]">
        <div>
          <span className="text-[#555]">Odds </span>
          <span className="text-white font-medium">{formatOdds(parlay.totalOdds)}</span>
        </div>
        <div>
          <span className="text-[#555]">Stake </span>
          <span className="text-white">{formatMoney(parlay.stake)}</span>
        </div>
        <div>
          <span className="text-[#555]">To Win </span>
          <span className="text-white">{formatMoney(parlay.potentialPayout - parlay.stake)}</span>
        </div>
      </div>
    </div>
  );
}
