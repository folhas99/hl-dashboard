import type { HlFill } from "@/lib/hyperliquid";

export type Summary = {
  totalFills: number;
  realizedPnl: number;
  totalFees: number;
  winRate: number;
  wins: number;
  losses: number;
  profitFactor: number | null;
  volumeUsd: number;
};

function toNum(v: any): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : 0;
  return Number.isFinite(n) ? n : 0;
}

export function computeSummary(fills: HlFill[]): Summary {
  const totalFills = fills.length;
  const pnls = fills.map((f) => toNum(f.closedPnl));
  const fees = fills.map((f) => toNum(f.fee));
  const realizedPnl = pnls.reduce((a, b) => a + b, 0);
  const totalFees = fees.reduce((a, b) => a + b, 0);

  const wins = pnls.filter((p) => p > 0).length;
  const losses = pnls.filter((p) => p < 0).length;
  const winRate = totalFills ? wins / totalFills : 0;

  const grossProfit = pnls.reduce((a, p) => a + Math.max(0, p), 0);
  const grossLoss = Math.abs(pnls.reduce((a, p) => a + Math.min(0, p), 0));
  const profitFactor = grossLoss ? grossProfit / grossLoss : null;

  const volumeUsd = fills.reduce((a, f) => a + Math.abs(toNum(f.px) * toNum(f.sz)), 0);

  return {
    totalFills,
    realizedPnl,
    totalFees,
    wins,
    losses,
    winRate,
    profitFactor,
    volumeUsd
  };
}

export function buildEquitySeries(fills: HlFill[]) {
  let cum = 0;
  return fills.map((f) => {
    cum += toNum(f.closedPnl);
    return {
      time: f.time,
      date: new Date(f.time).toISOString(),
      pnl: toNum(f.closedPnl),
      cumPnl: cum,
      coin: f.coin,
      side: f.side
    };
  });
}

export function groupDaily(series: ReturnType<typeof buildEquitySeries>) {
  const map = new Map<string, { day: string; pnl: number; cumPnl: number }>();
  let lastCum = 0;
  for (const p of series) {
    const d = new Date(p.time);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const prev = map.get(key);
    const pnl = (prev?.pnl ?? 0) + p.pnl;
    lastCum += p.pnl;
    map.set(key, { day: key, pnl, cumPnl: lastCum });
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}
