"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS, BET_TYPES } from "@/lib/utils";

export default function NewBetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    sport: "NFL",
    league: "",
    eventName: "",
    eventDate: "",
    betType: "MONEYLINE",
    selection: "",
    odds: "",
    stake: "",
    line: "",
    isLive: false,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        odds: parseInt(form.odds),
        stake: parseFloat(form.stake),
        line: form.line ? parseFloat(form.line) : null,
      }),
    });

    if (!res.ok) {
      setError("Failed to create bet");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const inputClass = "w-full bg-[#1a1a1a] rounded-xl px-4 py-3 text-[14px] border border-transparent focus:border-[#333]";

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold mb-8">New Bet</h1>

      {error && <div className="text-[13px] text-[#f87171] bg-[#2e1a1a] rounded-xl px-4 py-3 mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Sport</label>
            <select value={form.sport} onChange={(e) => update("sport", e.target.value)} className={inputClass}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">League</label>
            <input type="text" value={form.league} onChange={(e) => update("league", e.target.value)} className={inputClass} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] text-[#555] mb-2">Event</label>
          <input type="text" value={form.eventName} onChange={(e) => update("eventName", e.target.value)} className={inputClass} placeholder="Lakers vs Celtics" required />
        </div>

        <div>
          <label className="block text-[12px] text-[#555] mb-2">Event Date</label>
          <input type="datetime-local" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className={inputClass} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Bet Type</label>
            <select value={form.betType} onChange={(e) => update("betType", e.target.value)} className={inputClass}>
              {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Selection</label>
            <input type="text" value={form.selection} onChange={(e) => update("selection", e.target.value)} className={inputClass} placeholder="Lakers ML" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Odds</label>
            <input type="number" value={form.odds} onChange={(e) => update("odds", e.target.value)} className={inputClass} placeholder="-110" required />
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Stake ($)</label>
            <input type="number" step="0.01" value={form.stake} onChange={(e) => update("stake", e.target.value)} className={inputClass} placeholder="100" required />
          </div>
          <div>
            <label className="block text-[12px] text-[#555] mb-2">Line</label>
            <input type="number" step="0.5" value={form.line} onChange={(e) => update("line", e.target.value)} className={inputClass} placeholder="-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-3 py-1">
          <input
            type="checkbox"
            id="isLive"
            checked={form.isLive}
            onChange={(e) => update("isLive", e.target.checked)}
            className="w-4 h-4 rounded accent-white"
          />
          <label htmlFor="isLive" className="text-[13px] text-[#888]">Live bet</label>
        </div>

        <div>
          <label className="block text-[12px] text-[#555] mb-2">Notes</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Optional" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a1a1a] hover:bg-[#222] text-white py-3 rounded-xl text-[14px] font-medium transition-all disabled:opacity-40 mt-2"
        >
          {loading ? "..." : "Log Bet"}
        </button>
      </form>
    </div>
  );
}
