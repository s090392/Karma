import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultMoveProfile, type MoveJob, type MoveProfile } from "@/lib/move";

function buildCv(job: MoveJob, profile: MoveProfile) {
  const skills = ["controls", "stakeholder management", "automation governance", "process improvement", "risk analysis", "exception handling", "client communication", "financial operations", "AI workflow design", "change management"];
  return {
    professionalSummary: `Experienced ${profile.targetRoles[0] || "professional"} known for improving operations, controls, and stakeholder outcomes. Brings proof-led experience in ${profile.proofPoints.filter(Boolean)[0] || "process improvement"} and a strong bias toward judgment-heavy work. This CV is tailored to ${job.jobTitle} at ${job.company}.`,
    keySkills: skills,
    experienceSection: [
      {
        company: "Current / Recent Employer",
        title: profile.targetRoles[0] || "Domain Professional",
        period: "Recent experience",
        bullets: profile.proofPoints.filter(Boolean).slice(0, 3).map((point) => `Delivered impact: ${point}.`),
      },
    ],
    educationSection: [{ institution: "Add institution", degree: "Add degree", year: "Add year" }],
    requirementsMet: [
      { requirement: "Role-specific domain experience", evidence: profile.careerStory || "Candidate career story aligns with the role." },
      { requirement: "Impact orientation", evidence: profile.proofPoints.filter(Boolean)[0] || "Add a quantified proof point for stronger tailoring." },
    ],
    gaps: ["Review dates, employer names, and exact metrics before submitting."],
    atsKeywords: skills.concat(["governance", "transformation", "reporting", "forecasting", "audit"]).slice(0, 15),
  };
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
  const cv = buildCv(job, body.moveProfile || defaultMoveProfile());
  if (user && body.jobApplicationId) {
    await db.jobApplication.update({ where: { id: body.jobApplicationId }, data: { tailoredCvUrl: `data:application/json,${encodeURIComponent(JSON.stringify(cv))}` } });
  }
  return NextResponse.json({ cv, tailoredCvUrl: `data:application/json,${encodeURIComponent(JSON.stringify(cv))}` });
}
