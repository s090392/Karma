import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  email: z.string().email().max(160),
  countryCode: z.string().min(2).max(6).optional().default("GLOBAL"),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const email = body.data.email.toLowerCase().trim();
  const code = "123456";
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await db.user.upsert({
    where: { email },
    update: { countryCode: body.data.countryCode },
    create: { email, countryCode: body.data.countryCode },
  });

  await db.otpChallenge.create({
    data: { email, codeHash, expiresAt, userId: user.id },
  });

  return NextResponse.json({
    ok: true,
    message: "Development OTP generated. Production should send this code by email.",
    devCode: code,
    expiresAt,
  });
}
