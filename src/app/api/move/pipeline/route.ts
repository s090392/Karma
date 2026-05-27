import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ grouped: {}, applications: [] });
  const applications = await db.jobApplication.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const grouped = applications.reduce<Record<string, typeof applications>>((acc, item) => {
    acc[item.status] = acc[item.status] || [];
    acc[item.status].push(item);
    return acc;
  }, {});
  return NextResponse.json({ grouped, applications });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  const body = (await request.json()) as {
    jobTitle: string;
    company: string;
    jobDescription: string;
    jobUrl?: string;
    source?: string;
    location?: string;
    salaryRange?: string;
    overallScore?: number;
    grade?: string;
    scoreDetails?: string;
    status?: string;
  };
  if (!user) return NextResponse.json({ ...body, id: `local-${Date.now()}`, createdAt: new Date().toISOString() });
  const record = await db.jobApplication.create({
    data: {
      userId: user.id,
      jobTitle: body.jobTitle,
      company: body.company,
      jobDescription: (body.jobDescription || "").slice(0, 5000),
      jobUrl: body.jobUrl,
      source: body.source,
      location: body.location,
      salaryRange: body.salaryRange,
      overallScore: body.overallScore,
      grade: body.grade,
      scoreDetails: body.scoreDetails,
      status: body.status || "saved",
    },
  });
  return NextResponse.json({ application: record });
}
