import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculatePayout } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;

  const parlays = await prisma.parlay.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, image: true } },
      legs: { include: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(parlays);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const userId = (session.user as { id: string }).id;

    // Calculate combined odds (multiply decimal odds)
    let decimalOdds = 1;
    for (const leg of body.legs) {
      const odds = leg.odds;
      if (odds > 0) {
        decimalOdds *= (odds / 100) + 1;
      } else {
        decimalOdds *= (100 / Math.abs(odds)) + 1;
      }
    }
    // Convert back to American
    let totalOdds: number;
    if (decimalOdds >= 2) {
      totalOdds = Math.round((decimalOdds - 1) * 100);
    } else {
      totalOdds = Math.round(-100 / (decimalOdds - 1));
    }

    const potentialPayout = calculatePayout(body.stake, totalOdds);

    const parlay = await prisma.parlay.create({
      data: {
        userId,
        name: body.name || null,
        totalOdds,
        stake: body.stake,
        potentialPayout,
        isSameGame: body.isSameGame || false,
        legs: {
          create: body.legs.map((leg: Record<string, unknown>) => ({
            userId,
            sport: leg.sport as string,
            league: (leg.league as string) || null,
            eventName: leg.eventName as string,
            eventDate: new Date(leg.eventDate as string),
            betType: leg.betType as string,
            selection: leg.selection as string,
            odds: leg.odds as number,
            stake: body.stake as number,
            potentialPayout: calculatePayout(body.stake as number, leg.odds as number),
            line: (leg.line as number) || null,
            isLive: (leg.isLive as boolean) || false,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        legs: true,
      },
    });

    return NextResponse.json(parlay);
  } catch {
    return NextResponse.json({ error: "Failed to create parlay" }, { status: 500 });
  }
}
