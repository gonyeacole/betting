import { formatMoney } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export default function StatsCard({ label, value, subtext, color = "text-foreground" }: StatsCardProps) {
  const displayValue = typeof value === "number" && label.toLowerCase().includes("profit")
    ? formatMoney(value)
    : typeof value === "number" && label.toLowerCase().includes("roi")
    ? `${value.toFixed(1)}%`
    : value;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{displayValue}</p>
      {subtext && <p className="text-xs text-muted mt-1">{subtext}</p>}
    </div>
  );
}
