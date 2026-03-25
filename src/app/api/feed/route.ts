import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);
  followingIds.push(userId); // Include own bets

  const [bets, parlays] = await Promise.all([
    prisma.bet.findMany({
      where: { userId: { in: followingIds }, parlayId: null },
      include: {
        user: { select: { id: true, name: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.parlay.findMany({
      where: { userId: { in: followingIds } },
      include: {
        user: { select: { id: true, name: true, image: true } },
        legs: { include: { likes: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Merge and sort by date
  const feed = [
    ...bets.map((b) => ({ ...b, _type: "bet" as const })),
    ...parlays.map((p) => ({ ...p, _type: "parlay" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(feed);
}
