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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          {showUser && (
            <Link href={`/profile/${parlay.user.id}`} className="text-sm font-medium text-gray-600 hover:text-green-600">
              {parlay.user.name}
            </Link>
          )}
          <h3 className="font-bold text-lg text-gray-900">
            {parlay.isSameGame ? "Same Game Parlay" : "Parlay"} ({parlay.legs.length} legs)
          </h3>
          {parlay.name && <p className="text-sm text-gray-500">{parlay.name}</p>}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${resultColor(parlay.result)}`}>
          {parlay.result}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {parlay.legs.map((leg) => (
          <div key={leg.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
            <div>
              <span className="font-medium">{leg.eventName}</span>
              <span className="text-gray-500 ml-2">{betTypeLabel(leg.betType)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{leg.selection}</span>
              {leg.line != null && <span className="text-gray-500">({leg.line > 0 ? "+" : ""}{leg.line})</span>}
              <span className="text-gray-600">{formatOdds(leg.odds)}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${resultColor(leg.result)}`}>
                {leg.result}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm border-t pt-3">
        <div>
          <span className="text-gray-500">Odds:</span>{" "}
          <span className="font-bold">{formatOdds(parlay.totalOdds)}</span>
        </div>
        <div>
          <span className="text-gray-500">Stake:</span>{" "}
          <span className="font-semibold">{formatMoney(parlay.stake)}</span>
        </div>
        <div>
          <span className="text-gray-500">To Win:</span>{" "}
          <span className="font-semibold text-green-600">{formatMoney(parlay.potentialPayout - parlay.stake)}</span>
        </div>
      </div>
    </div>
  );
}
