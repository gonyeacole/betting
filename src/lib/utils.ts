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
    case "WON": return "text-success bg-success/10";
    case "LOST": return "text-danger bg-danger/10";
    case "PUSH": return "text-warning bg-warning/10";
    case "VOID": return "text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.04)]";
    default: return "text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.04)]";
  }
}

export function betTypeLabel(betType: string): string {
  switch (betType) {
    case "MONEYLINE": return "moneyline";
    case "SPREAD": return "spread";
    case "OVER_UNDER": return "over/under";
    case "LIVE": return "live";
    default: return betType.toLowerCase();
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
