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
  if (status === "loading") return <div className="text-xs text-[#aaa] py-20">...</div>;
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
      setError("failed to create parlay");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-sm mb-8">new parlay</h1>

      {error && <div className="text-[11px] text-[#999] mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b bg-transparent pb-2 text-xs"
                placeholder="optional"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">stake</label>
              <input
                type="number"
                step="0.01"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className="w-full border-b bg-transparent pb-2 text-xs"
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
              className="accent-[#111]"
            />
            <label htmlFor="isSameGame" className="text-[10px] text-[#aaa]">
              same game parlay
            </label>
          </div>

          {combinedOdds && (
            <div className="text-xs text-[#111]">
              combined odds: {combinedOdds}
            </div>
          )}
        </div>

        {legs.map((leg, idx) => (
          <div key={idx} className="border-t pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest text-[#aaa]">leg {idx + 1}</span>
              {legs.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeLeg(idx)}
                  className="text-[10px] text-[#ccc] hover:text-[#111] transition-colors"
                >
                  remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-[#ccc] mb-1">sport</label>
                <select
                  value={leg.sport}
                  onChange={(e) => updateLeg(idx, "sport", e.target.value)}
                  className="w-full border-b bg-transparent pb-1 text-xs"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#ccc] mb-1">bet type</label>
                <select
                  value={leg.betType}
                  onChange={(e) => updateLeg(idx, "betType", e.target.value)}
                  className="w-full border-b bg-transparent pb-1 text-xs"
                >
                  {BET_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[#ccc] mb-1">event</label>
              <input
                type="text"
                value={leg.eventName}
                onChange={(e) => updateLeg(idx, "eventName", e.target.value)}
                className="w-full border-b bg-transparent pb-1 text-xs"
                placeholder="lakers vs celtics"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#ccc] mb-1">event date</label>
              <input
                type="datetime-local"
                value={leg.eventDate}
                onChange={(e) => updateLeg(idx, "eventDate", e.target.value)}
                className="w-full border-b bg-transparent pb-1 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-[#ccc] mb-1">selection</label>
                <input
                  type="text"
                  value={leg.selection}
                  onChange={(e) => updateLeg(idx, "selection", e.target.value)}
                  className="w-full border-b bg-transparent pb-1 text-xs"
                  placeholder="lakers ml"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#ccc] mb-1">odds</label>
                <input
                  type="number"
                  value={leg.odds}
                  onChange={(e) => updateLeg(idx, "odds", e.target.value)}
                  className="w-full border-b bg-transparent pb-1 text-xs"
                  placeholder="-110"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#ccc] mb-1">line</label>
                <input
                  type="number"
                  step="0.5"
                  value={leg.line}
                  onChange={(e) => updateLeg(idx, "line", e.target.value)}
                  className="w-full border-b bg-transparent pb-1 text-xs"
                  placeholder="-3.5"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addLeg}
          className="w-full text-xs text-[#aaa] hover:text-[#111] transition-colors border-t pt-4"
        >
          + add leg
        </button>

        <button
          type="submit"
          disabled={loading}
          className="text-xs text-[#111] underline underline-offset-4 hover:no-underline transition-all disabled:text-[#ccc]"
        >
          {loading ? "..." : "log parlay"}
        </button>
      </form>
    </div>
  );
}
