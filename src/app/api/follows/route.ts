import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { followerId, followingId } = await req.json();

  if (!followerId || !followingId) {
    return NextResponse.json({ error: "followerId and followingId required" }, { status: 400 });
  }

  if (followerId === followingId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId, followingId } });
  return NextResponse.json({ following: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const [followers, following] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, image: true } } },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, image: true } } },
    }),
  ]);

  return NextResponse.json({ followers, following });
}
