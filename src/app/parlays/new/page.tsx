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
  if (status === "loading") return <div className="text-[14px] text-[#555] py-20 text-center">...</div>;
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

  const inputClass = "w-full bg-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] border border-transparent focus:border-[#333]";
  const inputSmClass = "w-full bg-[#111] rounded-lg px-3 py-2 text-[13px] border border-transparent focus:border-[#333]";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-8">New Parlay</h1>

      {error && <div className="text-[13px] text-[#f87171] bg-[#2e1a1a] rounded-xl px-4 py-3 mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Total Stake ($)</label>
            <input type="number" step="0.01" value={stake} onChange={(e) => setStake(e.target.value)} className={inputClass} required />
          </div>
        </div>

        <div className="flex items-center gap-3 py-1">
          <input type="checkbox" id="isSameGame" checked={isSameGame} onChange={(e) => setIsSameGame(e.target.checked)} className="w-4 h-4 rounded accent-white" />
          <label htmlFor="isSameGame" className="text-[13px] text-[#888]">Same Game Parlay</label>
        </div>

        {combinedOdds && (
          <div className="text-[14px] text-white font-medium">Combined Odds: {combinedOdds}</div>
        )}

        {legs.map((leg, idx) => (
          <div key={idx} className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[12px] text-[#555] font-medium">Leg {idx + 1}</span>
              {legs.length > 2 && (
                <button type="button" onClick={() => removeLeg(idx)} className="text-[11px] text-[#444] hover:text-[#888] transition-colors">
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#444] mb-1">Sport</label>
                <select value={leg.sport} onChange={(e) => updateLeg(idx, "sport", e.target.value)} className={inputSmClass}>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#444] mb-1">Bet Type</label>
                <select value={leg.betType} onChange={(e) => updateLeg(idx, "betType", e.target.value)} className={inputSmClass}>
                  {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#444] mb-1">Event</label>
              <input type="text" value={leg.eventName} onChange={(e) => updateLeg(idx, "eventName", e.target.value)} className={inputSmClass} placeholder="Lakers vs Celtics" required />
            </div>

            <div>
              <label className="block text-[11px] text-[#444] mb-1">Event Date</label>
              <input type="datetime-local" value={leg.eventDate} onChange={(e) => updateLeg(idx, "eventDate", e.target.value)} className={inputSmClass} required />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-[#444] mb-1">Selection</label>
                <input type="text" value={leg.selection} onChange={(e) => updateLeg(idx, "selection", e.target.value)} className={inputSmClass} placeholder="Lakers ML" required />
              </div>
              <div>
                <label className="block text-[11px] text-[#444] mb-1">Odds</label>
                <input type="number" value={leg.odds} onChange={(e) => updateLeg(idx, "odds", e.target.value)} className={inputSmClass} placeholder="-110" required />
              </div>
              <div>
                <label className="block text-[11px] text-[#444] mb-1">Line</label>
                <input type="number" step="0.5" value={leg.line} onChange={(e) => updateLeg(idx, "line", e.target.value)} className={inputSmClass} placeholder="-3.5" />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLeg}
          className="w-full py-3 text-[13px] text-[#555] hover:text-[#888] bg-[#1a1a1a] hover:bg-[#222] rounded-xl transition-all"
        >
          + Add Leg
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-40"
        >
          {loading ? "..." : "Log Parlay"}
        </button>
      </form>
    </div>
  );
}
