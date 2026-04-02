"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SPORTS, BET_TYPES } from "@/lib/utils";

export default function NewBetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    sport: "NFL", league: "", eventName: "", eventDate: "",
    betType: "MONEYLINE", selection: "", odds: "", stake: "", line: "",
    isLive: false, notes: "",
  });

  if (status === "unauthenticated") { router.push("/login"); return null; }
  if (status === "loading") return <div className="text-center py-20 text-[rgba(255,255,255,0.3)] font-light">loading...</div>;
  if (!session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/bets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, odds: parseInt(form.odds), stake: parseFloat(form.stake), line: form.line ? parseFloat(form.line) : null }),
    });
    if (!res.ok) { setError("Failed to create bet"); setLoading(false); return; }
    router.push("/dashboard");
  };

  const update = (field: string, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <h1 className="text-3xl font-light text-gradient mb-8">new bet</h1>

      {error && <div className="bg-danger/10 text-danger p-3 rounded-2xl mb-4 text-sm font-light">{error}</div>}

      <form onSubmit={handleSubmit} className="glass rounded-4xl p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">sport</label>
            <select value={form.sport} onChange={(e) => update("sport", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm">
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">league (optional)</label>
            <input type="text" value={form.league} onChange={(e) => update("league", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Premier League" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">event</label>
          <input type="text" value={form.eventName} onChange={(e) => update("eventName", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Lakers vs Celtics" required />
        </div>

        <div>
          <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">event date</label>
          <input type="datetime-local" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">bet type</label>
            <select value={form.betType} onChange={(e) => update("betType", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm">
              {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">selection</label>
            <input type="text" value={form.selection} onChange={(e) => update("selection", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="e.g. Lakers ML" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">odds</label>
            <input type="number" value={form.odds} onChange={(e) => update("odds", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="-110" required />
          </div>
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">stake ($)</label>
            <input type="number" step="0.01" value={form.stake} onChange={(e) => update("stake", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="100" required />
          </div>
          <div>
            <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">line</label>
            <input type="number" step="0.5" value={form.line} onChange={(e) => update("line", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" placeholder="-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="isLive" checked={form.isLive} onChange={(e) => update("isLive", e.target.checked)} className="rounded border-[rgba(255,255,255,0.1)] bg-transparent accent-[#6366f1]" />
          <label htmlFor="isLive" className="text-sm text-[rgba(255,255,255,0.3)] font-light">live / in-game bet</label>
        </div>

        <div>
          <label className="block text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className="input-glass w-full rounded-xl px-4 py-3 text-sm" rows={2} placeholder="why you like this bet..." />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-glow py-3 rounded-full text-sm font-medium disabled:opacity-50">
          {loading ? "placing bet..." : "log bet"}
        </button>
      </form>
    </div>
  );
}
