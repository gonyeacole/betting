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
  if (status === "loading") return <div className="text-xs text-[#aaa] py-20">...</div>;
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
      setError("failed to create bet");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-sm mb-8">new bet</h1>

      {error && <div className="text-[11px] text-[#999] mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">sport</label>
            <select
              value={form.sport}
              onChange={(e) => update("sport", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">league</label>
            <input
              type="text"
              value={form.league}
              onChange={(e) => update("league", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
              placeholder="optional"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">event</label>
          <input
            type="text"
            value={form.eventName}
            onChange={(e) => update("eventName", e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs"
            placeholder="lakers vs celtics"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">event date</label>
          <input
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">bet type</label>
            <select
              value={form.betType}
              onChange={(e) => update("betType", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
            >
              {BET_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>{bt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">selection</label>
            <input
              type="text"
              value={form.selection}
              onChange={(e) => update("selection", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
              placeholder="lakers ml"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">odds</label>
            <input
              type="number"
              value={form.odds}
              onChange={(e) => update("odds", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
              placeholder="-110"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">stake</label>
            <input
              type="number"
              step="0.01"
              value={form.stake}
              onChange={(e) => update("stake", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
              placeholder="100"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">line</label>
            <input
              type="number"
              step="0.5"
              value={form.line}
              onChange={(e) => update("line", e.target.value)}
              className="w-full border-b bg-transparent pb-2 text-xs"
              placeholder="-3.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isLive"
            checked={form.isLive}
            onChange={(e) => update("isLive", e.target.checked)}
            className="accent-[#111]"
          />
          <label htmlFor="isLive" className="text-[10px] text-[#aaa]">
            live bet
          </label>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-[#aaa] mb-2">notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full border-b bg-transparent pb-2 text-xs resize-none"
            rows={2}
            placeholder="optional"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="text-xs text-[#111] underline underline-offset-4 hover:no-underline transition-all disabled:text-[#ccc] pt-4"
        >
          {loading ? "..." : "log bet"}
        </button>
      </form>
    </div>
  );
}
