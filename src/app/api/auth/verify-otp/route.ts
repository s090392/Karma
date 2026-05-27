import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().max(160),
  code: z.string().length(6),
  countryCode: z.string().min(2).max(6).optional().default("GLOBAL"),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Enter the 6 digit OTP." }, { status: 400 });

  const email = body.data.email.toLowerCase().trim();
  const challenge = await db.otpChallenge.findFirst({
    where: {
      email,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });

  const isValid = await bcrypt.compare(body.data.code, challenge.codeHash);
  if (!isValid) return NextResponse.json({ error: "Invalid OTP." }, { status: 400 });

  const user = await db.user.upsert({
    where: { email },
    update: { countryCode: body.data.countryCode },
    create: { email, countryCode: body.data.countryCode },
  });

  await db.otpChallenge.update({ where: { id: challenge.id }, data: { usedAt: new Date(), userId: user.id } });
  await db.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, plan: "free", status: "active" },
  });
  await createSession({ id: user.id, email: user.email, phone: user.phone });

  return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
}
