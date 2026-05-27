import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildMissionPlan } from "@/lib/mission";

const schema = z.object({
  track: z.string().min(1).max(80),
  label: z.string().min(1).max(300),
  done: z.boolean(),
});

export async function GET() {
  const user = await requireSessionUser();
  const latest = await db.assessment.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const saved = await db.missionAction.findMany({ where: { userId: user.id } });
  const plan = buildMissionPlan(latest?.functionArea || "generic", { rag: (latest?.rag as "green" | "amber" | "red") || "amber" });
  return NextResponse.json({ plan, saved });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Action is invalid." }, { status: 400 });

  const action = await db.missionAction.upsert({
    where: { userId_track_label: { userId: user.id, track: body.data.track, label: body.data.label } },
    update: { done: body.data.done },
    create: { userId: user.id, track: body.data.track, label: body.data.label, done: body.data.done },
  });
  return NextResponse.json({ action });
}
