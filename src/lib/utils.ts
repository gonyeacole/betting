export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function calculatePayout(stake: number, odds: number): number {
  if (odds > 0) {
    return stake * (odds / 100) + stake;
  } else {
    return stake * (100 / Math.abs(odds)) + stake;
  }
}

export function resultColor(result: string): string {
  switch (result) {
    case "WON": return "text-green-600 bg-green-50";
    case "LOST": return "text-red-600 bg-red-50";
    case "PUSH": return "text-yellow-600 bg-yellow-50";
    case "VOID": return "text-gray-600 bg-gray-50";
    default: return "text-blue-600 bg-blue-50";
  }
}

export function betTypeLabel(betType: string): string {
  switch (betType) {
    case "MONEYLINE": return "Moneyline";
    case "SPREAD": return "Spread";
    case "OVER_UNDER": return "Over/Under";
    case "LIVE": return "Live";
    default: return betType;
  }
}

export const SPORTS = [
  "NFL", "NBA", "MLB", "NHL", "NCAA Football", "NCAA Basketball",
  "Soccer", "Tennis", "Golf", "Boxing", "MMA/UFC", "F1",
  "NASCAR", "Cricket", "Rugby", "Esports", "Other",
] as const;

export const BET_TYPES = [
  { value: "MONEYLINE", label: "Moneyline" },
  { value: "SPREAD", label: "Spread" },
  { value: "OVER_UNDER", label: "Over/Under" },
  { value: "LIVE", label: "Live Bet" },
] as const;
