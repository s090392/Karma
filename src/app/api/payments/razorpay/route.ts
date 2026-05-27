import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const payload = await request.text();
  await db.paymentEvent.create({
    data: {
      provider: "razorpay",
      eventType: "checkout_or_webhook_stub",
      status: "received",
      payloadHash: String(payload.length),
    },
  });
  return NextResponse.json({ ok: true, mode: "provider-hook-ready" });
}
