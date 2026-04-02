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
    <div className="glass rounded-3xl p-5">
      <p className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-[0.2em] mb-2">{label}</p>
      <p className={`text-2xl font-light ${color}`}>{displayValue}</p>
      {subtext && <p className="text-xs text-[rgba(255,255,255,0.25)] mt-1">{subtext}</p>}
    </div>
  );
}
