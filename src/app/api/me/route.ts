import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ user: null });

  const user = await db.user.findUnique({
    where: { id: session.id },
    include: {
      subscription: true,
      streak: true,
      assessments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  return NextResponse.json({ user });
}
