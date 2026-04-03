import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePayout } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const sport = searchParams.get("sport");
  const betType = searchParams.get("betType");
  const result = searchParams.get("result");

  const where: Record<string, unknown> = { parlayId: null };
  if (userId) where.userId = userId;
  if (sport) where.sport = sport;
  if (betType) where.betType = betType;
  if (result) where.result = result;

  const bets = await prisma.bet.findMany({
    where,
    include: { user: { select: { id: true, name: true, image: true } }, likes: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(bets);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Get the first user as default if no userId provided
    let userId = body.userId;
    if (!userId) {
      const firstUser = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
      if (!firstUser) {
        return NextResponse.json({ error: "No users exist. Visit /api/seed first." }, { status: 400 });
      }
      userId = firstUser.id;
    }

    const potentialPayout = calculatePayout(body.stake, body.odds);

    const bet = await prisma.bet.create({
      data: {
        userId,
        sport: body.sport,
        league: body.league || null,
        eventName: body.eventName,
        eventDate: new Date(body.eventDate),
        betType: body.betType,
        selection: body.selection,
        odds: body.odds,
        stake: body.stake,
        potentialPayout,
        line: body.line || null,
        isLive: body.isLive || false,
        notes: body.notes || null,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(bet);
  } catch {
    return NextResponse.json({ error: "Failed to create bet" }, { status: 500 });
  }
}
