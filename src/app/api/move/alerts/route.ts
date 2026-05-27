import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ alerts: null, newMatches: 0 });
  const record = await db.user.findUnique({ where: { id: user.id }, select: { moveAlerts: true, lastAlertCheck: true } });
  return NextResponse.json({ alerts: record?.moveAlerts ? JSON.parse(record.moveAlerts) : null, lastAlertCheck: record?.lastAlertCheck, newMatches: 3 });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  const body = (await request.json()) as { targetRoles: string[]; locations: string[]; frequency: "daily" | "weekly" };
  if (!user) return NextResponse.json({ alerts: body, newMatches: 0 });
  const updated = await db.user.update({
    where: { id: user.id },
    data: { moveAlerts: JSON.stringify(body), lastAlertCheck: new Date() },
    select: { moveAlerts: true, lastAlertCheck: true },
  });
  return NextResponse.json({ alerts: JSON.parse(updated.moveAlerts || "{}"), lastAlertCheck: updated.lastAlertCheck });
}
