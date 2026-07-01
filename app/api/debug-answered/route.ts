import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const allAnswered = await prisma.entry.findMany({
    where: { userId, type: "action_answered" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { what: true, whyFeeling: true, createdAt: true },
  });

  const recentAnswered = await prisma.entry.findMany({
    where: { userId, type: "action_answered", createdAt: { gte: oneWeekAgo } },
    select: { what: true, createdAt: true },
  });

  return NextResponse.json({
    userId: userId.slice(0, 8) + "...",
    allAnswered,
    recentAnswered,
    oneWeekAgo: oneWeekAgo.toISOString(),
  });
}
