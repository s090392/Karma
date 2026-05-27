import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  plan: z.enum(["free", "explorer", "navigator", "pioneer"]),
});

export async function GET() {
  const user = await requireSessionUser();
  const subscription = await db.subscription.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ subscription });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Plan is invalid." }, { status: 400 });

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const subscription = await db.subscription.upsert({
    where: { userId: user.id },
    update: { plan: body.data.plan, status: "active", currentPeriodEnd },
    create: { userId: user.id, plan: body.data.plan, status: "active", currentPeriodEnd },
  });

  return NextResponse.json({ subscription });
}
