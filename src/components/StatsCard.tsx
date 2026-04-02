import { formatMoney } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export default function StatsCard({ label, value, subtext, color }: StatsCardProps) {
  const displayValue = typeof value === "number" && label.toLowerCase().includes("profit")
    ? formatMoney(value)
    : typeof value === "number" && label.toLowerCase().includes("roi")
    ? `${value.toFixed(1)}%`
    : value;

  const isPositive = color?.includes("green");
  const isNegative = color?.includes("red");

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4">
      <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-semibold ${isPositive ? "text-white" : isNegative ? "text-[#666]" : "text-white"}`}>
        {displayValue}
      </p>
      {subtext && <p className="text-[11px] text-[#444] mt-1">{subtext}</p>}
    </div>
  );
}
