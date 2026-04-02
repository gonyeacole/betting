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
  if (status === "loading") return <div className="text-center py-20 text-muted">loading...</div>;
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

  const inputClass = "w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground text-sm placeholder:text-subtle focus:outline-none focus:border-subtle transition-colors";
  const labelClass = "block text-xs text-muted uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">new parlay</h1>

      {error && <div className="bg-danger/10 text-danger p-3 rounded-xl mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>parlay name (optional)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="my big parlay" />
            </div>
            <div>
              <label className={labelClass}>total stake ($)</label>
              <input type="number" step="0.01" value={stake} onChange={(e) => setStake(e.target.value)} className={inputClass} required />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isSameGame" checked={isSameGame} onChange={(e) => setIsSameGame(e.target.checked)} className="rounded border-border bg-background" />
            <label htmlFor="isSameGame" className="text-sm text-muted">same game parlay (SGP)</label>
          </div>

          {combinedOdds && (
            <div className="text-sm font-medium text-foreground">
              combined odds: <span className="text-success">{combinedOdds}</span>
            </div>
          )}
        </div>

        {legs.map((leg, idx) => (
          <div key={idx} className="bg-card border border-border p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-foreground">leg {idx + 1}</h3>
              {legs.length > 2 && (
                <button type="button" onClick={() => removeLeg(idx)} className="text-danger text-xs hover:opacity-70 transition-opacity">
                  remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>sport</label>
                <select value={leg.sport} onChange={(e) => updateLeg(idx, "sport", e.target.value)} className={inputClass}>
                  {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>bet type</label>
                <select value={leg.betType} onChange={(e) => updateLeg(idx, "betType", e.target.value)} className={inputClass}>
                  {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>event</label>
              <input type="text" value={leg.eventName} onChange={(e) => updateLeg(idx, "eventName", e.target.value)} className={inputClass} placeholder="Lakers vs Celtics" required />
            </div>

            <div>
              <label className={labelClass}>event date</label>
              <input type="datetime-local" value={leg.eventDate} onChange={(e) => updateLeg(idx, "eventDate", e.target.value)} className={inputClass} required />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>selection</label>
                <input type="text" value={leg.selection} onChange={(e) => updateLeg(idx, "selection", e.target.value)} className={inputClass} placeholder="Lakers ML" required />
              </div>
              <div>
                <label className={labelClass}>odds</label>
                <input type="number" value={leg.odds} onChange={(e) => updateLeg(idx, "odds", e.target.value)} className={inputClass} placeholder="-110" required />
              </div>
              <div>
                <label className={labelClass}>line</label>
                <input type="number" step="0.5" value={leg.line} onChange={(e) => updateLeg(idx, "line", e.target.value)} className={inputClass} placeholder="-3.5" />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLeg}
          className="w-full border border-dashed border-border text-muted py-2.5 rounded-2xl text-sm hover:border-subtle hover:text-foreground transition-colors"
        >
          + add leg
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "creating parlay..." : "log parlay"}
        </button>
      </form>
    </div>
  );
}
