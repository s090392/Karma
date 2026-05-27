import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const { pin } = await request.json();
  if (pin !== process.env.KARMA_ADMIN_PIN) {
    return NextResponse.json({ error: "Invalid admin PIN." }, { status: 401 });
  }

  const [users, paidUsers, assessments, subscriptions] = await Promise.all([
    db.user.count(),
    db.subscription.count({ where: { plan: { not: "free" }, status: "active" } }),
    db.assessment.count(),
    db.subscription.findMany({ where: { status: "active" } }),
  ]);

  const prices: Record<string, number> = { free: 0, explorer: 299, navigator: 799, pioneer: 1499 };
  const mrr = subscriptions.reduce((sum, sub) => sum + (prices[sub.plan] || 0), 0);

  return NextResponse.json({
    users,
    paidUsers,
    assessments,
    mrr,
    planBreakdown: subscriptions.reduce<Record<string, number>>((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {}),
  });
}
