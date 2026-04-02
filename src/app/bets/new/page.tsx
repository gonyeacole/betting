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

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  if (status === "loading") return <div className="text-center py-20 text-muted">loading...</div>;
  if (!session) return null;

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

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground text-sm placeholder:text-subtle focus:outline-none focus:border-subtle transition-colors";
  const labelClass = "block text-xs text-muted uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">new bet</h1>

      {error && <div className="bg-danger/10 text-danger p-3 rounded-xl mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-2xl space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>sport</label>
            <select value={form.sport} onChange={(e) => update("sport", e.target.value)} className={inputClass}>
              {SPORTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>league (optional)</label>
            <input type="text" value={form.league} onChange={(e) => update("league", e.target.value)} className={inputClass} placeholder="e.g. Premier League" />
          </div>
        </div>

        <div>
          <label className={labelClass}>event</label>
          <input type="text" value={form.eventName} onChange={(e) => update("eventName", e.target.value)} className={inputClass} placeholder="e.g. Lakers vs Celtics" required />
        </div>

        <div>
          <label className={labelClass}>event date</label>
          <input type="datetime-local" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} className={inputClass} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>bet type</label>
            <select value={form.betType} onChange={(e) => update("betType", e.target.value)} className={inputClass}>
              {BET_TYPES.map((bt) => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>selection</label>
            <input type="text" value={form.selection} onChange={(e) => update("selection", e.target.value)} className={inputClass} placeholder="e.g. Lakers ML" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>odds (american)</label>
            <input type="number" value={form.odds} onChange={(e) => update("odds", e.target.value)} className={inputClass} placeholder="-110" required />
          </div>
          <div>
            <label className={labelClass}>stake ($)</label>
            <input type="number" step="0.01" value={form.stake} onChange={(e) => update("stake", e.target.value)} className={inputClass} placeholder="100" required />
          </div>
          <div>
            <label className={labelClass}>
              line {form.betType === "SPREAD" ? "(spread)" : form.betType === "OVER_UNDER" ? "(total)" : "(optional)"}
            </label>
            <input type="number" step="0.5" value={form.line} onChange={(e) => update("line", e.target.value)} className={inputClass} placeholder="-3.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isLive" checked={form.isLive} onChange={(e) => update("isLive", e.target.checked)} className="rounded border-border bg-background" />
          <label htmlFor="isLive" className="text-sm text-muted">live / in-game bet</label>
        </div>

        <div>
          <label className={labelClass}>notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} className={inputClass} rows={2} placeholder="why you like this bet..." />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-background py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "placing bet..." : "log bet"}
        </button>
      </form>
    </div>
  );
}
