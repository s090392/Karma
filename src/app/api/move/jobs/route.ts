import { NextResponse } from "next/server";
import { buildSearchUrls, sampleMoveJobs } from "@/lib/move";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get("role") || "finance controls analyst";
  const location = url.searchParams.get("location") || "India";
  const sources = (url.searchParams.get("source") || "Naukri,LinkedIn,Indeed")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return NextResponse.json({
    searchUrls: buildSearchUrls(role, location, sources),
    examples: sampleMoveJobs,
  });
}
