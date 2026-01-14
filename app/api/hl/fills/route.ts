import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/session";
import { fetchUserFillsByTime } from "@/lib/hyperliquid";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.tradingAccount.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  if (!account || !account.address) {
    return NextResponse.json({ error: "No Hyperliquid address set. Go to Settings." }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const now = Date.now();
  const startTime = Number(searchParams.get("startTime") ?? "") || now - 90 * 24 * 3600 * 1000;
  const endTime = Number(searchParams.get("endTime") ?? "") || now;

  try {
    const fills = await fetchUserFillsByTime({ user: account.address, startTime, endTime, aggregateByTime: true });
    return NextResponse.json({ fills, address: account.address, startTime, endTime });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Fetch failed" }, { status: 502 });
  }
}
