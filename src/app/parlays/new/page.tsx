"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS, BET_TYPES } from "@/lib/utils";

interface Leg {
  sport: string; league: string; eventName: string; eventDate: string;
  betType: string; selection: string; odds: string; line: string;
}

const emptyLeg = (): Leg => ({
  sport: "NFL", league: "", eventName: "", eventDate: "",
  betType: "MONEYLINE", selection: "", odds: "", line: "",
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

  if (status === "unauthenticated") { router.push("/login"); return null; }
  if (status === "loading") return <div className="text-center py-20 text-[rgba(255,255,255,0.3)] font-light">loading...</div>;
  if (!session) return null;

  const updateLeg = (idx: number, field: string, value: string) => {
    setLegs((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLeg = () => setLegs((prev) => [...prev, emptyLeg()]);
  const removeLeg = (idx: number) => { if (legs.length <= 2) return; setLegs((prev) => prev.filter((_, i) => i !== idx)); };

  const combinedOdds = (() => {
    let decimal = 1;
    for (const leg of legs) {
      const odds = parseInt(leg.odds);
      if (isNaN(odds)) return null;
      decimal *= odds > 0 ? odds / 100 + 1 : 100 / Math.abs(odds) + 1;
    }
    return decimal >= 2 ? `+${Math.round((decimal - 1) * 100)}` : `${Math.round(-100 / (decimal - 1))}`;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/parlays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || null, stake: parseFloat(stake), isSameGame,
        legs: legs.map((l) => ({ ...l, odds: parseInt(l.odds), line: l.line ? parseFloat(l.line) : null })),
      }),
    });
    if (!res.ok) { setError("Failed to create parlay"); setLoading(false); return; }
    router.push("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto animate-in">
      <h1 className="text-3xl font-light text-gradient mb-8">new parlay</h1>

      {error && <div className="bg-danger/10 text-danger p-3 rounded-2xl mb-4 text-sm font-light">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass rounded-4xl p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="my big parlay" />
            </div>
            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">total stake ($)</label>
              <input type="number" step="0.01" value={stake} onChange={(e) => setStake(e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" required />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isSameGame" checked={isSameGame} onChange={(e) => setIsSameGame(e.target.checked)} className="rounded border-[rgba(255,255,255,0.1)] bg-transparent accent-[#6366f1]" />
            <label htmlFor="isSameGame" className="text-sm text-[rgba(255,255,255,0.3)] font-light">same game parlay (SGP)</label>
          </div>

          {combinedOdds && (
            <div className="text-sm font-light text-foreground">
              combined odds: <span className="text-gradient font-medium">{combinedOdds}</span>
            </div>
          )}
        </div>

        {legs.map((leg, idx) => (
          <div key={idx} className="glass rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-light text-foreground">leg {idx + 1}</h3>
              {legs.length > 2 && (
                <button type="button" onClick={() => removeLeg(idx)} className="text-danger text-[10px] hover:opacity-70 transition-opacity">remove</button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">sport</label>
                <select value={leg.sport} onChange={(e) => updateLeg(idx, "sport", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm">
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">bet type</label>
                <select value={leg.betType} onChange={(e) => updateLeg(idx, "betType", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm">
                  {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">event</label>
              <input type="text" value={leg.eventName} onChange={(e) => updateLeg(idx, "eventName", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" placeholder="Lakers vs Celtics" required />
            </div>

            <div>
              <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">event date</label>
              <input type="datetime-local" value={leg.eventDate} onChange={(e) => updateLeg(idx, "eventDate", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" required />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">selection</label>
                <input type="text" value={leg.selection} onChange={(e) => updateLeg(idx, "selection", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" placeholder="Lakers ML" required />
              </div>
              <div>
                <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">odds</label>
                <input type="number" value={leg.odds} onChange={(e) => updateLeg(idx, "odds", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" placeholder="-110" required />
              </div>
              <div>
                <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">line</label>
                <input type="number" step="0.5" value={leg.line} onChange={(e) => updateLeg(idx, "line", e.target.value)} className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" placeholder="-3.5" />
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={addLeg} className="w-full btn-ghost py-3 rounded-full text-sm font-light border-dashed">
          + add leg
        </button>

        <button type="submit" disabled={loading} className="w-full btn-glow py-3 rounded-full text-sm font-medium disabled:opacity-50">
          {loading ? "creating parlay..." : "log parlay"}
        </button>
      </form>
    </div>
  );
}
