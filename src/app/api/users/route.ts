import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  const where = search
    ? { name: { contains: search } }
    : {};

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      createdAt: true,
      _count: { select: { bets: true, followers: true, following: true } },
    },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
