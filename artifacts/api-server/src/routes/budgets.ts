import { Router, type IRouter } from "express";
import { budgetsStore } from "../lib/in-memory-db";

const router: IRouter = Router();

router.get("/budgets", async (_req, res): Promise<void> => {
  res.json(budgetsStore);
});

router.post("/budgets", async (req, res): Promise<void> => {
  const { category, limitAmount, period, budgetType } = req.body;

  if (!category || !limitAmount) {
    res.status(400).json({ error: "category and limitAmount are required" });
    return;
  }

  const newBudget = {
    id: budgetsStore.length + 1,
    category,
    limitAmount: Number(limitAmount),
    spentAmount: 0,
    period: period || "monthly",
    budgetType: budgetType || "category",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  budgetsStore.push(newBudget);
  res.status(201).json(newBudget);
});

router.patch("/budgets/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const idx = budgetsStore.findIndex((b) => b.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  budgetsStore[idx] = { ...budgetsStore[idx], ...req.body };
  res.json(budgetsStore[idx]);
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const idx = budgetsStore.findIndex((b) => b.id === id);

  if (idx === -1) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  budgetsStore.splice(idx, 1);
  res.sendStatus(204);
});

export default router;
