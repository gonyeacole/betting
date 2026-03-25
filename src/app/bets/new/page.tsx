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
  if (status === "loading") return <div className="text-center py-20">Loading...</div>;
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Bet</h1>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select
              value={form.sport}
              onChange={(e) => update("sport", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {SPORTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">League (optional)</label>
            <input
              type="text"
              value={form.league}
              onChange={(e) => update("league", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g. Premier League"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
          <input
            type="text"
            value={form.eventName}
            onChange={(e) => update("eventName", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="e.g. Lakers vs Celtics"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
          <input
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => update("eventDate", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bet Type</label>
            <select
              value={form.betType}
              onChange={(e) => update("betType", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {BET_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>{bt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selection</label>
            <input
              type="text"
              value={form.selection}
              onChange={(e) => update("selection", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="e.g. Lakers ML, Over 220.5"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Odds (American)</label>
            <input
              type="number"
              value={form.odds}
              onChange={(e) => update("odds", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="-110"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stake ($)</label>
            <input
              type="number"
              step="0.01"
              value={form.stake}
              onChange={(e) => update("stake", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Line {form.betType === "SPREAD" ? "(Spread)" : form.betType === "OVER_UNDER" ? "(Total)" : "(optional)"}
            </label>
            <input
              type="number"
              step="0.5"
              value={form.line}
              onChange={(e) => update("line", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="-3.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isLive"
            checked={form.isLive}
            onChange={(e) => update("isLive", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="isLive" className="text-sm font-medium text-gray-700">
            This is a live/in-game bet
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            rows={2}
            placeholder="Why you like this bet..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Placing Bet..." : "Log Bet"}
        </button>
      </form>
    </div>
  );
}
