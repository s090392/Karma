import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST() {
  const user = await requireSessionUser();
  const existing = await db.streak.findUnique({ where: { userId: user.id } });
  const today = startOfToday();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (existing?.lastCheckin && existing.lastCheckin >= today) return NextResponse.json({ streak: existing });

  const nextStreak = existing?.lastCheckin && existing.lastCheckin >= yesterday ? existing.streak + 1 : 1;
  const streak = await db.streak.upsert({
    where: { userId: user.id },
    update: {
      streak: nextStreak,
      longestStreak: Math.max(nextStreak, existing?.longestStreak || 0),
      lastCheckin: today,
    },
    create: { userId: user.id, streak: 1, longestStreak: 1, lastCheckin: today },
  });
  return NextResponse.json({ streak });
}
