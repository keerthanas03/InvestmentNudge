import { Router, type IRouter } from "express";
import { eq, gte } from "drizzle-orm";
import { db, transactionsTable, investmentsTable, nudgesTable } from "@workspace/db";

const router: IRouter = Router();

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#22c55e",
  "Shopping": "#3b82f6",
  "Entertainment": "#a855f7",
  "Transportation": "#f59e0b",
  "Subscriptions": "#ef4444",
  "Groceries": "#10b981",
  "Healthcare": "#06b6d4",
  "Travel": "#f97316",
  "Electronics": "#6366f1",
  "Clothing": "#ec4899",
};

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const allNudges = await db.select().from(nudgesTable);
  const allInvestments = await db.select().from(investmentsTable);
  const allTransactions = await db.select().from(transactionsTable);

  const totalNudgesFired = allNudges.length;
  const investmentsTriggered = allInvestments.filter(i => i.source === "auto").length;
  const totalAmountInvested = allInvestments.reduce((sum, i) => sum + i.amount, 0);

  const acceptedNudges = allNudges.filter(n => n.status === "accepted").length;
  const resolvedNudges = allNudges.filter(n => n.status !== "pending").length;
  const nudgeAcceptanceRate = resolvedNudges > 0 ? (acceptedNudges / resolvedNudges) * 100 : 0;

  const impulseCount = allTransactions.filter(t => t.isImpulse).length;
  const avgImpulseScore = allTransactions.length > 0
    ? (impulseCount / allTransactions.length) * 100
    : 0;

  res.json({
    totalNudgesFired,
    investmentsTriggered,
    totalTransactions: allTransactions.length,
    totalUsers: 1,
    avgImpulseScore: Math.round(avgImpulseScore),
    totalAmountInvested,
    nudgeAcceptanceRate: Math.round(nudgeAcceptanceRate),
  });
});

router.get("/admin/spending-trends", async (_req, res): Promise<void> => {
  const days = 30;
  const trend = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const txns = await db
      .select()
      .from(transactionsTable)
      .where(gte(transactionsTable.createdAt, date));

    const dayTxns = txns.filter(t => new Date(t.createdAt) < nextDate);
    const totalSpend = dayTxns.reduce((sum, t) => sum + t.amount, 0);
    const impulseSpend = dayTxns.filter(t => t.isImpulse).reduce((sum, t) => sum + t.amount, 0);
    const normalSpend = totalSpend - impulseSpend;

    trend.push({
      date: date.toISOString().split("T")[0],
      totalSpend,
      impulseSpend,
      normalSpend,
    });
  }

  res.json(trend);
});

router.get("/admin/category-analysis", async (_req, res): Promise<void> => {
  const txns = await db.select().from(transactionsTable);

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const txn of txns) {
    if (!categoryMap[txn.category]) {
      categoryMap[txn.category] = { amount: 0, count: 0 };
    }
    categoryMap[txn.category].amount += txn.amount;
    categoryMap[txn.category].count += 1;
  }

  const analysis = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    color: CATEGORY_COLORS[category] ?? "#6b7280",
  }));

  analysis.sort((a, b) => b.amount - a.amount);
  res.json(analysis);
});

export default router;
