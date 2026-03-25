import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const bet = await prisma.bet.findUnique({ where: { id } });

  if (!bet || bet.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  let profit: number | null = null;

  if (body.result === "WON") {
    profit = bet.potentialPayout - bet.stake;
  } else if (body.result === "LOST") {
    profit = -bet.stake;
  } else if (body.result === "PUSH") {
    profit = 0;
  }

  const updated = await prisma.bet.update({
    where: { id },
    data: { ...body, profit },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const bet = await prisma.bet.findUnique({ where: { id } });

  if (!bet || bet.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.bet.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
