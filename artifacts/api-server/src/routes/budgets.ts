import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, budgetsTable } from "@workspace/db";
import {
  CreateBudgetBody,
  UpdateBudgetBody,
  UpdateBudgetParams,
  DeleteBudgetParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/budgets", async (_req, res): Promise<void> => {
  const budgets = await db.select().from(budgetsTable).orderBy(budgetsTable.category);
  res.json(budgets);
});

router.post("/budgets", async (req, res): Promise<void> => {
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [budget] = await db
    .insert(budgetsTable)
    .values({
      category: parsed.data.category,
      limitAmount: parsed.data.limitAmount,
      spentAmount: 0,
      period: parsed.data.period,
      budgetType: parsed.data.budgetType,
      isActive: true,
    })
    .returning();

  res.status(201).json(budget);
});

router.patch("/budgets/:id", async (req, res): Promise<void> => {
  const params = UpdateBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.limitAmount !== undefined) updateData.limitAmount = parsed.data.limitAmount;
  if (parsed.data.period !== undefined) updateData.period = parsed.data.period;
  if (parsed.data.budgetType !== undefined) updateData.budgetType = parsed.data.budgetType;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [budget] = await db
    .update(budgetsTable)
    .set(updateData)
    .where(eq(budgetsTable.id, params.data.id))
    .returning();

  if (!budget) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.json(budget);
});

router.delete("/budgets/:id", async (req, res): Promise<void> => {
  const params = DeleteBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [budget] = await db
    .delete(budgetsTable)
    .where(eq(budgetsTable.id, params.data.id))
    .returning();

  if (!budget) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
