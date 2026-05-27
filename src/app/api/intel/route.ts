import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const fallbackItems = [
  {
    category: "Automation",
    title: "Finance operations teams are moving from processing to exception control.",
    translation: "If your work is mostly standard matching, reporting, or follow-up, your safest move is toward exception investigation and controls.",
    impact: "Critical",
    source: "KARMA market model",
  },
  {
    category: "Opportunity",
    title: "AI-literate team leads are becoming internal translators.",
    translation: "Your moat improves when you can explain what should be automated, what should stay human, and why.",
    impact: "Opportunity",
    source: "KARMA employer signals",
  },
  {
    category: "Skill",
    title: "Prompting alone is not enough; workflow ownership matters more.",
    translation: "Document one full workflow you can redesign with AI assistance. That is stronger than listing tools on a resume.",
    impact: "High",
    source: "KARMA skill graph",
  },
];

export async function GET() {
  const user = await requireSessionUser();
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  const items = await db.intelligenceItem.findMany({
    where: {
      OR: [
        { segment: dbUser?.segment || "generic" },
        { functionArea: dbUser?.functionArea || "generic" },
        { segment: "generic" },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 10,
  });

  return NextResponse.json({ items: items.length ? items : fallbackItems });
}
