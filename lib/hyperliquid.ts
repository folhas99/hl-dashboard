export const HL_INFO_URL = process.env.HL_INFO_URL ?? "https://api.hyperliquid.xyz/info";

export type HlFill = {
  coin: string;
  side: "A" | "B";
  px: string;
  sz: string;
  time: number;
  dir?: string;
  closedPnl?: string;
  fee?: string;
  feeToken?: string;
  oid?: number;
  tid?: number;
  hash?: string;
};

async function postInfo<T>(body: any, signal?: AbortSignal): Promise<T> {
  const res = await fetch(HL_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Hyperliquid info error: ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

export async function fetchUserFillsByTime(args: {
  user: string;
  startTime: number;
  endTime: number;
  aggregateByTime?: boolean;
  maxPages?: number;
}): Promise<HlFill[]> {
  const { user, startTime, endTime, aggregateByTime = true, maxPages = 20 } = args;
  let cursor = startTime;
  const out: HlFill[] = [];

  for (let page = 0; page < maxPages; page++) {
    const fills = await postInfo<HlFill[]>(
      {
        type: "userFillsByTime",
        user,
        startTime: cursor,
        endTime,
        aggregateByTime
      }
    );

    if (!Array.isArray(fills) || fills.length === 0) break;

    // API usually returns newest->oldest or time-sorted? We handle either.
    out.push(...fills);

    const maxTime = Math.max(...fills.map((f) => f.time ?? 0));
    if (!maxTime || maxTime >= endTime) break;

    // paginate: next startTime should be last returned timestamp + 1ms
    cursor = maxTime + 1;

    // if response is <2000, likely finished
    if (fills.length < 2000) break;
  }

  // Normalize order ascending by time
  out.sort((a, b) => (a.time ?? 0) - (b.time ?? 0));
  return out;
}

export async function fetchUserFees(user: string): Promise<any> {
  return postInfo<any>({ type: "userFees", user });
}

export async function fetchClearinghouseState(user: string): Promise<any> {
  return postInfo<any>({ type: "clearinghouseState", user });
}
