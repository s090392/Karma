import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultMoveProfile, type MoveJob, type MoveProfile } from "@/lib/move";

function buildCoverLetter(job: MoveJob, profile: MoveProfile) {
  const proof = profile.proofPoints.filter(Boolean)[0] || "improved a critical business process with measurable ownership";
  return `The ${job.jobTitle} role at ${job.company} stands out because it appears to need practical judgment, not just task execution. My work has been strongest where finance operations, controls, stakeholders, and change need to come together with accountability.\n\nOne example: ${proof}. That kind of work is exactly what I would bring into this role: understanding the operating reality, finding the highest-friction points, and creating proof that the process is safer, faster, or more commercially useful.\n\nIn the first 90 days, I would map the current workflow, identify where automation can help without weakening control, and build trust with the teams who depend on the output. I would aim to create one visible improvement early, then scale it into a repeatable operating rhythm.\n\nRegards,\n${profile.careerStory ? "Candidate" : "Karma Move candidate"}`;
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  const body = (await request.json()) as { jobApplicationId?: string; job?: MoveJob; moveProfile?: MoveProfile };
  let job = body.job;
  if (user && body.jobApplicationId) {
    const record = await db.jobApplication.findFirst({ where: { id: body.jobApplicationId, userId: user.id } });
    if (record) job = record as unknown as MoveJob;
  }
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  const coverLetter = buildCoverLetter(job, body.moveProfile || defaultMoveProfile());
  if (user && body.jobApplicationId) {
    await db.jobApplication.update({ where: { id: body.jobApplicationId }, data: { coverLetterText: coverLetter } });
  }
  return NextResponse.json({ coverLetter });
}
