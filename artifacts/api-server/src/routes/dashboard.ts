import { Router, type IRouter } from "express";
import { eq, gte, sql, desc } from "drizzle-orm";
import { db, transactionsTable, investmentsTable, nudgesTable, budgetsTable, categoriesTable } from "@workspace/db";

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

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allTransactions = await db.select().from(transactionsTable);
  const todayTransactions = allTransactions.filter(t => new Date(t.createdAt) >= today);
  const todaySpend = todayTransactions.reduce((sum, t) => sum + t.amount, 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyTransactions = allTransactions.filter(t => new Date(t.createdAt) >= weekAgo);
  const weeklySpend = weeklyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthlyTransactions = allTransactions.filter(t => new Date(t.createdAt) >= monthAgo);
  const monthlySpend = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

  const allInvestments = await db.select().from(investmentsTable);
  const totalInvested = allInvestments.reduce((sum, i) => sum + i.amount, 0);

  const pendingNudges = await db.select().from(nudgesTable).where(eq(nudgesTable.status, "pending"));

  const impulseCount = allTransactions.filter(t => t.isImpulse).length;
  const totalCount = allTransactions.length;
  const impulseScore = totalCount > 0 ? Math.min(100, Math.round((impulseCount / totalCount) * 100)) : 0;

  const budgets = await db.select().from(budgetsTable);
  const activeAlerts = budgets.filter(b => b.isActive && b.spentAmount >= b.limitAmount * 0.8).length;

  res.json({
    todaySpend,
    totalInvested,
    impulseScore,
    activeAlerts,
    weeklySpend,
    monthlySpend,
    pendingNudgesCount: pendingNudges.length,
    totalTransactions: allTransactions.length,
  });
});

router.get("/dashboard/spending-trend", async (_req, res): Promise<void> => {
  const days = 14;
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

router.get("/dashboard/category-breakdown", async (_req, res): Promise<void> => {
  const txns = await db.select().from(transactionsTable);

  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const txn of txns) {
    if (!categoryMap[txn.category]) {
      categoryMap[txn.category] = { amount: 0, count: 0 };
    }
    categoryMap[txn.category].amount += txn.amount;
    categoryMap[txn.category].count += 1;
  }

  const breakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    amount: data.amount,
    count: data.count,
    color: CATEGORY_COLORS[category] ?? "#6b7280",
  }));

  breakdown.sort((a, b) => b.amount - a.amount);
  res.json(breakdown);
});

export default router;
