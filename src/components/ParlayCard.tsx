"use client";

import Link from "next/link";
import { formatOdds, formatMoney, resultColor, betTypeLabel } from "@/lib/utils";

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
  return (
    <div className="glass rounded-3xl p-5 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          {showUser && (
            <Link href={`/profile/${parlay.user.id}`} className="text-xs text-[rgba(255,255,255,0.3)] hover:text-foreground transition-all duration-300">
              {parlay.user.name}
            </Link>
          )}
          <h3 className="font-medium text-foreground text-sm">
            {parlay.isSameGame ? "same game parlay" : "parlay"} ({parlay.legs.length} legs)
          </h3>
          {parlay.name && <p className="text-xs text-[rgba(255,255,255,0.3)] font-light">{parlay.name}</p>}
        </div>
        <span className={`text-[10px] font-medium px-3 py-1 rounded-full ${resultColor(parlay.result)}`}>
          {parlay.result.toLowerCase()}
        </span>
      </div>

      <div className="space-y-0 mb-4">
        {parlay.legs.map((leg) => (
          <div key={leg.id} className="flex items-center justify-between py-2.5 text-sm border-b border-[rgba(255,255,255,0.04)] last:border-0">
            <div>
              <span className="text-foreground font-light">{leg.eventName}</span>
              <span className="text-[rgba(255,255,255,0.2)] ml-2 text-[10px]">{betTypeLabel(leg.betType)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-foreground text-xs font-light">{leg.selection}</span>
              {leg.line != null && <span className="text-[rgba(255,255,255,0.2)] text-[10px]">({leg.line > 0 ? "+" : ""}{leg.line})</span>}
              <span className="text-[rgba(255,255,255,0.25)] text-[10px]">{formatOdds(leg.odds)}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${resultColor(leg.result)}`}>
                {leg.result.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="divider-gradient mb-3" />

      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">odds </span>
          <span className="text-foreground font-light">{formatOdds(parlay.totalOdds)}</span>
        </div>
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">stake </span>
          <span className="text-foreground font-light">{formatMoney(parlay.stake)}</span>
        </div>
        <div>
          <span className="text-[rgba(255,255,255,0.25)] text-xs">to win </span>
          <span className="text-foreground font-light">{formatMoney(parlay.potentialPayout - parlay.stake)}</span>
        </div>
      </div>
    </div>
  );
}
