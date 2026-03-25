import { formatMoney } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
}

export default function StatsCard({ label, value, subtext, color = "text-gray-900" }: StatsCardProps) {
  const displayValue = typeof value === "number" && label.toLowerCase().includes("profit")
    ? formatMoney(value)
    : typeof value === "number" && label.toLowerCase().includes("roi")
    ? `${value.toFixed(1)}%`
    : value;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{displayValue}</p>
      {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
  );
}
