import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultMoveProfile, evaluateJobDeterministic, extractJobBasics, type MoveProfile } from "@/lib/move";

async function fetchJobText(jobUrl: string) {
  const response = await fetch(jobUrl, { headers: { "User-Agent": "KarmaMove/1.0" } });
  if (!response.ok) throw new Error("Unable to fetch job page.");
  const html = await response.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { jobUrl?: string; jobDescription?: string; moveProfile?: MoveProfile; userId?: string };
  let jobDescription = (body.jobDescription || "").trim();
  if (!jobDescription && body.jobUrl) {
    try {
      jobDescription = await fetchJobText(body.jobUrl);
    } catch {
      return NextResponse.json({ error: "Could not fetch this job page. Please paste the job description manually." }, { status: 400 });
    }
  }
  if (!jobDescription) return NextResponse.json({ error: "Paste a job description or job URL." }, { status: 400 });

  const profile = body.moveProfile || defaultMoveProfile();
  const evaluation = evaluateJobDeterministic(jobDescription, profile);
  const basics = extractJobBasics(jobDescription, body.jobUrl);
  const user = await getSessionUser();

  let jobApplication = null;
  if (user) {
    jobApplication = await db.jobApplication.create({
      data: {
        userId: user.id,
        ...basics,
        jobUrl: body.jobUrl,
        jobDescription: jobDescription.slice(0, 5000),
        source: body.jobUrl ? "url" : "manual",
        overallScore: evaluation.overallScore,
        grade: evaluation.grade,
        cvMatch: evaluation.dimensions.cvMatch.score,
        roleFit: evaluation.dimensions.roleFit.score,
        careerGrowth: evaluation.dimensions.careerGrowth.score,
        aiStability: evaluation.dimensions.aiStability.score,
        companyHealth: evaluation.dimensions.companyHealth.score,
        strategicFit: evaluation.dimensions.strategicFit.score,
        scoreDetails: JSON.stringify(evaluation),
      },
    });
  }

  return NextResponse.json({
    job: {
      id: jobApplication?.id || `local-${Date.now()}`,
      ...basics,
      jobUrl: body.jobUrl,
      jobDescription: jobDescription.slice(0, 5000),
      source: body.jobUrl ? "url" : "manual",
      status: "evaluated",
      createdAt: new Date().toISOString(),
      evaluation,
    },
    evaluation,
  });
}
