import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [bets, parlays] = await Promise.all([
    prisma.bet.findMany({
      where: { parlayId: null },
      include: {
        user: { select: { id: true, name: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.parlay.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
        legs: { include: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const feed = [
    ...bets.map((b) => ({ ...b, _type: "bet" as const })),
    ...parlays.map((p) => ({ ...p, _type: "parlay" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(feed);
}
