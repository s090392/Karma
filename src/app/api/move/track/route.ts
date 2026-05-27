import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  const body = (await request.json()) as {
    id: string;
    status?: string;
    notes?: string;
    appliedAt?: string;
    interviewAt?: string;
    followUpDate?: string;
  };
  if (!user) return NextResponse.json({ ...body, updatedAt: new Date().toISOString() });
  const updated = await db.jobApplication.update({
    where: { id: body.id, userId: user.id },
    data: {
      status: body.status,
      notes: body.notes,
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : undefined,
      interviewAt: body.interviewAt ? new Date(body.interviewAt) : undefined,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
    },
  });
  return NextResponse.json({ application: updated });
}
