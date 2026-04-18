import { Router, type IRouter } from "express";
import { transactionsStore, nudgesStore, investmentsStore } from "../lib/in-memory-db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTxns = transactionsStore.filter((t) => new Date(t.createdAt) >= today);
  const todaySpend = todayTxns.reduce((sum, t) => sum + t.amount, 0);

  const totalInvested = investmentsStore.reduce((sum, i) => sum + i.amount, 0);

  const impulseTxns = transactionsStore.filter((t) => t.isImpulse);
  const impulseScore =
    transactionsStore.length > 0
      ? Math.round((impulseTxns.length / transactionsStore.length) * 100)
      : 0;

  const activeAlerts = nudgesStore.filter((n) => n.status === "pending").length;

  res.json({
    todaySpend,
    totalInvested,
    impulseScore,
    activeAlerts,
    totalBalance: 125000,
    monthlySpending: transactionsStore.reduce((sum, t) => sum + t.amount, 0),
    savingsRate: 18.5,
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

    const dayTxns = transactionsStore.filter((t) => {
      const d = new Date(t.createdAt);
      return d >= date && d < nextDate;
    });

    // Add some random variation so charts look interesting even without real data
    const baseSpend = dayTxns.reduce((sum, t) => sum + t.amount, 0) || Math.round(Math.random() * 3000 + 500);
    const impulseSpend = dayTxns.filter((t) => t.isImpulse).reduce((sum, t) => sum + t.amount, 0) || Math.round(baseSpend * 0.4);

    trend.push({
      date: date.toISOString().split("T")[0],
      totalSpend: baseSpend,
      impulseSpend,
      normalSpend: baseSpend - impulseSpend,
    });
  }

  res.json(trend);
});

router.get("/dashboard/category-breakdown", async (_req, res): Promise<void> => {
  const categoryMap: Record<string, number> = {};

  for (const txn of transactionsStore) {
    categoryMap[txn.category] = (categoryMap[txn.category] || 0) + txn.amount;
  }

  const breakdown = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
  }));

  breakdown.sort((a, b) => b.amount - a.amount);
  res.json(breakdown);
});

export default router;
