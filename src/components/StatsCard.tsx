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
    <div className="border-b pb-3">
      <p className="text-[10px] uppercase tracking-widest text-[#aaa] mb-1">{label}</p>
      <p className={`text-sm ${isPositive ? "text-[#222]" : isNegative ? "text-[#999]" : "text-[#111]"}`}>
        {displayValue}
      </p>
      {subtext && <p className="text-[10px] text-[#ccc] mt-1">{subtext}</p>}
    </div>
  );
}
