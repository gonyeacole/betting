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

const resultLabel = (r: string) => {
  if (r === "WON") return "w";
  if (r === "LOST") return "l";
  if (r === "PUSH") return "p";
  if (r === "VOID") return "v";
  return "...";
};

export default function ParlayCard({ parlay, showUser = true }: ParlayCardProps) {
  return (
    <div className="border-b pb-5 mb-5 last:border-0">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-0.5">
          {showUser && (
            <Link href={`/profile/${parlay.user.id}`} className="text-[10px] text-[#aaa] hover:text-[#111] transition-colors">
              {parlay.user.name}
            </Link>
          )}
          <h3 className="text-xs">
            {parlay.isSameGame ? "sgp" : "parlay"} &middot; {parlay.legs.length} legs
          </h3>
          {parlay.name && <p className="text-[10px] text-[#aaa]">{parlay.name}</p>}
        </div>
        <span className={`text-[10px] ${parlay.result === "WON" ? "text-[#111]" : parlay.result === "LOST" ? "text-[#ccc]" : "text-[#aaa]"}`}>
          {resultLabel(parlay.result)}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {parlay.legs.map((leg) => (
          <div key={leg.id} className="flex items-center justify-between text-[11px] py-1">
            <div className="text-[#666]">
              <span>{leg.eventName}</span>
              <span className="text-[#aaa] ml-2">{betTypeLabel(leg.betType).toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-3 text-[#aaa]">
              <span className="text-[#666]">{leg.selection}</span>
              {leg.line != null && <span>({leg.line > 0 ? "+" : ""}{leg.line})</span>}
              <span>{formatOdds(leg.odds)}</span>
              <span className={`${leg.result === "WON" ? "text-[#111]" : leg.result === "LOST" ? "text-[#ccc]" : ""}`}>
                {resultLabel(leg.result)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-8 text-[11px] text-[#666] border-t pt-3">
        <div>
          <span className="text-[#aaa]">odds </span>{formatOdds(parlay.totalOdds)}
        </div>
        <div>
          <span className="text-[#aaa]">stake </span>{formatMoney(parlay.stake)}
        </div>
        <div>
          <span className="text-[#aaa]">to win </span>{formatMoney(parlay.potentialPayout - parlay.stake)}
        </div>
      </div>
    </div>
  );
}
