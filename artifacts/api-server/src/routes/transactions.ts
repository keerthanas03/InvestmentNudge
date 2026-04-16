import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, transactionsTable, nudgesTable, nudgeRulesTable, budgetsTable, gamificationTable, investmentsTable, investmentSettingsTable } from "@workspace/db";
import {
  CreateTransactionBody,
  GetTransactionParams,
  DeleteTransactionParams,
  ListTransactionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MERCHANTS = [
  "Swiggy", "Zomato", "Amazon", "Myntra", "Starbucks", "McDonald's",
  "Netflix", "Spotify", "Steam", "Apple Store", "Nykaa", "Ajio",
  "BookMyShow", "Uber", "Ola", "PhonePe", "PayTM", "IRCTC",
  "Flipkart", "BigBasket", "Grofers", "Jio", "DMart", "Reliance Fresh"
];

const CATEGORIES = [
  "Food & Dining", "Shopping", "Entertainment", "Transportation",
  "Subscriptions", "Groceries", "Healthcare", "Travel", "Electronics", "Clothing"
];

const IMPULSE_CATEGORIES = ["Shopping", "Entertainment", "Electronics", "Clothing"];

function detectImpulse(amount: number, category: string): boolean {
  if (amount > 2000) return true;
  if (IMPULSE_CATEGORIES.includes(category) && amount > 500) return true;
  return Math.random() < 0.25;
}

async function evaluateNudges(transactionId: number, amount: number, isImpulse: boolean) {
  if (!isImpulse) return;

  const rules = await db.select().from(nudgeRulesTable).where(eq(nudgeRulesTable.isActive, true));

  for (const rule of rules) {
    if (amount >= rule.thresholdAmount) {
      let suggestedInvestment = 0;
      if (rule.investmentType === "fixed") {
        suggestedInvestment = rule.investmentValue;
      } else {
        suggestedInvestment = (amount * rule.investmentValue) / 100;
      }

      await db.insert(nudgesTable).values({
        transactionId,
        nudgeRuleId: rule.id,
        message: rule.nudgeIntensity === "aggressive"
          ? `You just spent ₹${amount.toFixed(0)} — redirect ₹${suggestedInvestment.toFixed(0)} to investments now!`
          : `Nice spend! Consider investing ₹${suggestedInvestment.toFixed(0)} to balance it out.`,
        suggestedInvestment,
        status: "pending",
      });

      await db
        .update(transactionsTable)
        .set({ nudgeTriggered: true, investmentSuggested: suggestedInvestment })
        .where(eq(transactionsTable.id, transactionId));
    }
  }
}

async function updateBudgetSpent(category: string, amount: number) {
  const budgets = await db
    .select()
    .from(budgetsTable)
    .where(eq(budgetsTable.category, category));

  for (const budget of budgets) {
    if (budget.isActive) {
      await db
        .update(budgetsTable)
        .set({ spentAmount: budget.spentAmount + amount })
        .where(eq(budgetsTable.id, budget.id));
    }
  }
}

router.get("/transactions", async (req, res): Promise<void> => {
  const params = ListTransactionsQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 50;

  const txns = await db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit);

  res.json(txns);
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { merchant, amount, category, notes } = parsed.data;
  const isImpulse = detectImpulse(amount, category);

  const [txn] = await db
    .insert(transactionsTable)
    .values({
      merchant,
      amount,
      category,
      notes: notes ?? null,
      isImpulse,
      status: isImpulse ? "impulse" : "normal",
      nudgeTriggered: false,
    })
    .returning();

  await evaluateNudges(txn.id, amount, isImpulse);
  await updateBudgetSpent(category, amount);

  res.status(201).json(txn);
});

router.post("/transactions/simulate", async (req, res): Promise<void> => {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const amount = Math.round(Math.random() * 4900 + 100);
  const isImpulse = detectImpulse(amount, category);

  const [txn] = await db
    .insert(transactionsTable)
    .values({
      merchant,
      amount,
      category,
      isImpulse,
      status: isImpulse ? "impulse" : "normal",
      nudgeTriggered: false,
    })
    .returning();

  await evaluateNudges(txn.id, amount, isImpulse);
  await updateBudgetSpent(category, amount);

  res.status(201).json(txn);
});

router.get("/transactions/:id", async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [txn] = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id));

  if (!txn) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.json(txn);
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const params = DeleteTransactionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [txn] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, params.data.id))
    .returning();

  if (!txn) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
