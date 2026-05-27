import { NextResponse } from "next/server";
import { clearSession, requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const user = await requireSessionUser();
  await db.user.delete({ where: { id: user.id } });
  await clearSession();
  return NextResponse.json({ ok: true });
}
