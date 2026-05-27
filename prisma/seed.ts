import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const items = [
  {
    category: "Automation",
    segment: "bpo",
    functionArea: "fa",
    title: "F&A automation is moving from pilots into operating models.",
    translation:
      "If your week is dominated by invoice matching, standard reconciliations, and report refreshes, move toward exception control and client-facing judgment.",
    impact: "Critical",
    source: "KARMA market model",
  },
  {
    category: "Management",
    segment: "manager",
    functionArea: "generic",
    title: "Coordination-heavy managers face a new risk profile.",
    translation:
      "Your safety rises when you own decisions, budgets, customer impact, and transformation outcomes, not only follow-ups and meeting traffic.",
    impact: "High",
    source: "KARMA management signal",
  },
  {
    category: "Opportunity",
    segment: "it",
    functionArea: "it",
    title: "AI delivery creates demand for engineers who can verify and govern output.",
    translation:
      "Shift your proof from writing code alone to designing systems, reviewing AI output, and owning production reliability.",
    impact: "Opportunity",
    source: "KARMA skill graph",
  },
  {
    category: "Fresher",
    segment: "fresher",
    functionArea: "generic",
    title: "Freshers need portfolio evidence earlier than before.",
    translation:
      "Build small projects, workflow examples, and problem-solving notes so you are not judged only by entry-level task capacity.",
    impact: "Monitor",
    source: "KARMA graduate signal",
  },
];

async function main() {
  for (const item of items) {
    await prisma.intelligenceItem.create({ data: item });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
