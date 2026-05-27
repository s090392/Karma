import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateCareerSafety } from "@/lib/scoring";

const schema = z.object({
  segment: z.enum(["bpo", "it", "fresher", "manager", "robotics", "generic"]),
  functionArea: z.enum(["fa", "cs", "hr", "it", "analytics", "lpo", "operations", "generic"]),
  aiAdoption: z.enum(["none", "pilot", "scaling", "replacing"]),
  experienceYears: z.number().int().min(0).max(50),
  tenureYears: z.number().int().min(0).max(50),
  salary: z.number().int().min(0).max(5000000),
  fixedCommitmentPct: z.number().int().min(0).max(100),
  mechanicalAtoms: z.array(z.string()).max(30),
  logicalAtoms: z.array(z.string()).max(30),
  complacencyRatio: z.number().int().min(0).max(100).optional(),
  roboticsExposure: z.number().int().min(0).max(100).optional(),
  country: z.string().min(2).max(40),
});

export async function GET() {
  const user = await requireSessionUser();
  const assessments = await db.assessment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return NextResponse.json({ assessments });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "Assessment details are incomplete." }, { status: 400 });

  const score = calculateCareerSafety(body.data);
  const assessment = await db.assessment.create({
    data: {
      userId: user.id,
      segment: body.data.segment,
      functionArea: body.data.functionArea,
      aiAdoption: body.data.aiAdoption,
      experienceYears: body.data.experienceYears,
      tenureYears: body.data.tenureYears,
      country: body.data.country,
      riskScore: score.riskScore,
      logicQuotient: score.logicQuotient,
      safetyWindow: score.safetyWindow,
      safetyScore: score.safetyScore,
      valueDrift: score.valueDrift,
      rag: score.rag,
      atomRatio: score.atomRatio,
      roboticsExposure: body.data.roboticsExposure,
      complacencyRatio: body.data.complacencyRatio,
    },
  });

  await db.user.update({
    where: { id: user.id },
    data: { segment: body.data.segment, functionArea: body.data.functionArea },
  });

  return NextResponse.json({ assessment, score });
}
