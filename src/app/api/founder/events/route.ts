import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  type: z.string().min(2).max(80),
  segment: z.string().max(40).optional(),
  country: z.string().max(40).optional(),
  functionArea: z.string().max(40).optional(),
  plan: z.string().max(40).optional(),
  value: z.number().int().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET() {
  const events = await db.founderEvent.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await getSessionUser();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Invalid event." }, { status: 400 });

  const event = await db.founderEvent.create({
    data: {
      ...body.data,
      metadata: body.data.metadata as Prisma.InputJsonObject | undefined,
      ...(session ? { user: { connect: { id: session.id } } } : {}),
    },
  });

  return NextResponse.json({ event });
}
