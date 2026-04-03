import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Check env vars
  checks.POSTGRES_URL = process.env.POSTGRES_URL ? "set" : "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "not set (auto-detect)";

  // Check database connection
  try {
    const userCount = await prisma.user.count();
    checks.database = `connected (${userCount} users)`;
  } catch (e) {
    checks.database = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}
