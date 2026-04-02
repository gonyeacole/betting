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
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-subtle transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          {showUser && (
            <Link href={`/profile/${parlay.user.id}`} className="text-sm text-muted hover:text-foreground transition-colors">
              {parlay.user.name}
            </Link>
          )}
          <h3 className="font-medium text-foreground">
            {parlay.isSameGame ? "same game parlay" : "parlay"} ({parlay.legs.length} legs)
          </h3>
          {parlay.name && <p className="text-sm text-muted">{parlay.name}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${resultColor(parlay.result)}`}>
          {parlay.result.toLowerCase()}
        </span>
      </div>

      <div className="space-y-0 mb-4">
        {parlay.legs.map((leg) => (
          <div key={leg.id} className="flex items-center justify-between bg-white/[0.03] rounded-lg p-2.5 text-sm border-b border-border last:border-0">
            <div>
              <span className="text-foreground font-medium">{leg.eventName}</span>
              <span className="text-muted ml-2 text-xs">{betTypeLabel(leg.betType)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-foreground">{leg.selection}</span>
              {leg.line != null && <span className="text-muted text-xs">({leg.line > 0 ? "+" : ""}{leg.line})</span>}
              <span className="text-muted text-xs">{formatOdds(leg.odds)}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${resultColor(leg.result)}`}>
                {leg.result.toLowerCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm border-t border-border pt-3">
        <div>
          <span className="text-muted">odds </span>
          <span className="text-foreground font-medium">{formatOdds(parlay.totalOdds)}</span>
        </div>
        <div>
          <span className="text-muted">stake </span>
          <span className="text-foreground font-medium">{formatMoney(parlay.stake)}</span>
        </div>
        <div>
          <span className="text-muted">to win </span>
          <span className="text-foreground font-medium">{formatMoney(parlay.potentialPayout - parlay.stake)}</span>
        </div>
      </div>
    </div>
  );
}
