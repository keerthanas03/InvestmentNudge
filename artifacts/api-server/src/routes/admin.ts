import { Router, type IRouter } from "express";
import {
  nudgesStore,
  nudgeRulesStore,
  investmentsStore,
  transactionsStore,
} from "../lib/in-memory-db";

const router: IRouter = Router();

const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#14B8A6",
  "Shopping": "#EC4899",
  "Entertainment": "#FACC15",
  "Transport": "#A78BFA",
  "Subscriptions": "#22C55E",
  "Groceries": "#10b981",
  "Health & Medical": "#06b6d4",
  "Travel": "#f97316",
  "Electronics": "#6366f1",
  "Investments": "#22C55E",
};

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const totalNudgesFired = nudgesStore.length;
  const investmentsTriggered = investmentsStore.filter((i) => i.source === "auto").length;
  const totalAmountInvested = investmentsStore.reduce((sum, i) => sum + i.amount, 0);

  const acceptedNudges = nudgesStore.filter((n) => n.status === "accepted").length;
  const resolvedNudges = nudgesStore.filter((n) => n.status !== "pending").length;
  const nudgeAcceptanceRate = resolvedNudges > 0 ? (acceptedNudges / resolvedNudges) * 100 : 0;

  const impulseCount = transactionsStore.filter((t) => t.isImpulse).length;
  const avgImpulseScore =
    transactionsStore.length > 0 ? (impulseCount / transactionsStore.length) * 100 : 0;

  res.json({
    totalNudgesFired,
    investmentsTriggered,
    totalTransactions: transactionsStore.length,
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

    const dayTxns = transactionsStore.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= date && d < nextDate;
    });

    const totalSpend = dayTxns.reduce((sum, t) => sum + t.amount, 0);
    const impulseSpend = dayTxns.filter((t) => t.isImpulse).reduce((sum, t) => sum + t.amount, 0);
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
  const categoryMap: Record<string, { amount: number; count: number }> = {};

  for (const txn of transactionsStore) {
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
