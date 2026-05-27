import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generalizedInsightCache } from "@/lib/gtm";

const querySchema = z.object({
  country: z.string().optional().default("GLOBAL"),
  segment: z.string().optional().default("manager"),
  functionArea: z.string().optional().default("operations"),
  topic: z.string().optional().default("automation"),
  seniority: z.string().optional().default("middle"),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(url.searchParams.entries()));
  const cacheKey = `${query.country}:${query.segment}:${query.functionArea}:${query.topic}:${query.seniority}:v1`;
  const cached = await db.insightCache.findUnique({ where: { cacheKey } });
  if (cached) {
    await db.insightCache.update({ where: { cacheKey }, data: { hits: { increment: 1 } } });
    return NextResponse.json({ source: "cache", insight: cached });
  }

  const fallback =
    generalizedInsightCache.find((item) => item.key.includes(query.functionArea)) ?? generalizedInsightCache[0];

  return NextResponse.json({
    source: "template",
    insight: {
      cacheKey,
      title: fallback.title,
      body: fallback.body,
    },
  });
}
