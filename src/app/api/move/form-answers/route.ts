import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultMoveProfile, type MoveJob, type MoveProfile } from "@/lib/move";

export async function POST(request: Request) {
  const user = await getSessionUser();
  const body = (await request.json()) as { jobApplicationId?: string; job?: MoveJob; moveProfile?: MoveProfile; questions?: string[] };
  let job = body.job;
  if (user && body.jobApplicationId) {
    const record = await db.jobApplication.findFirst({ where: { id: body.jobApplicationId, userId: user.id } });
    if (record) job = record as unknown as MoveJob;
  }
  const profile = body.moveProfile || defaultMoveProfile();
  const answers = (body.questions || []).filter(Boolean).map((question) => ({
    question,
    answer: `In my experience, the best answer starts with evidence. ${profile.proofPoints.filter(Boolean)[0] || "I have improved operational outcomes by taking ownership of a measurable process."} For this ${job?.jobTitle || "role"}, I would bring the same operating discipline: understand the current workflow, identify the highest-risk or highest-value point, and create a practical improvement that stakeholders can trust. I would also review where AI can help responsibly without weakening control, quality, or customer confidence.`,
  }));
  if (user && body.jobApplicationId) {
    await db.jobApplication.update({ where: { id: body.jobApplicationId }, data: { formAnswers: JSON.stringify(answers) } });
  }
  return NextResponse.json({ answers });
}
