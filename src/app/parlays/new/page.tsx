"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS, BET_TYPES } from "@/lib/utils";

interface Leg {
  sport: string;
  league: string;
  eventName: string;
  eventDate: string;
  betType: string;
  selection: string;
  odds: string;
  line: string;
}

const emptyLeg = (): Leg => ({
  sport: "NFL",
  league: "",
  eventName: "",
  eventDate: "",
  betType: "MONEYLINE",
  selection: "",
  odds: "",
  line: "",
});

export default function NewParlayPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [stake, setStake] = useState("");
  const [isSameGame, setIsSameGame] = useState(false);
  const [legs, setLegs] = useState<Leg[]>([emptyLeg(), emptyLeg()]);

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  if (status === "loading") return <div className="text-center py-20">Loading...</div>;
  if (!session) return null;

  const updateLeg = (idx: number, field: string, value: string) => {
    setLegs((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLeg = () => setLegs((prev) => [...prev, emptyLeg()]);
  const removeLeg = (idx: number) => {
    if (legs.length <= 2) return;
    setLegs((prev) => prev.filter((_, i) => i !== idx));
  };

  const combinedOdds = (() => {
    let decimal = 1;
    for (const leg of legs) {
      const odds = parseInt(leg.odds);
      if (isNaN(odds)) return null;
      decimal *= odds > 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1;
    }
    return decimal >= 2
      ? `+${Math.round((decimal - 1) * 100)}`
      : `${Math.round(-100 / (decimal - 1))}`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/parlays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null,
        stake: parseFloat(stake),
        isSameGame,
        legs: legs.map((l) => ({
          ...l,
          odds: parseInt(l.odds),
          line: l.line ? parseFloat(l.line) : null,
        })),
      }),
    });

    if (!res.ok) {
      setError("Failed to create parlay");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Parlay</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parlay Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="My big parlay"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Stake ($)</label>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isSameGame"
              checked={isSameGame}
              onChange={(e) => setIsSameGame(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="isSameGame" className="text-sm font-medium text-gray-700">
              Same Game Parlay (SGP)
            </label>
          </div>

          {combinedOdds && (
            <div className="text-lg font-bold text-green-600">
              Combined Odds: {combinedOdds}
            </div>
          )}
        </div>

        {legs.map((leg, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-md space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Leg {idx + 1}</h3>
              {legs.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeLeg(idx)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sport</label>
                <select
                  value={leg.sport}
                  onChange={(e) => updateLeg(idx, "sport", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Bet Type</label>
                <select
                  value={leg.betType}
                  onChange={(e) => updateLeg(idx, "betType", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                >
                  {BET_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event</label>
              <input
                type="text"
                value={leg.eventName}
                onChange={(e) => updateLeg(idx, "eventName", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                placeholder="Lakers vs Celtics"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
              <input
                type="datetime-local"
                value={leg.eventDate}
                onChange={(e) => updateLeg(idx, "eventDate", e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Selection</label>
                <input
                  type="text"
                  value={leg.selection}
                  onChange={(e) => updateLeg(idx, "selection", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  placeholder="Lakers ML"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Odds</label>
                <input
                  type="number"
                  value={leg.odds}
                  onChange={(e) => updateLeg(idx, "odds", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  placeholder="-110"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Line</label>
                <input
                  type="number"
                  step="0.5"
                  value={leg.line}
                  onChange={(e) => updateLeg(idx, "line", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                  placeholder="-3.5"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLeg}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition border border-dashed border-gray-300"
        >
          + Add Leg
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Creating Parlay..." : "Log Parlay"}
        </button>
      </form>
    </div>
  );
}
