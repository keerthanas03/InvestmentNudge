import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, nudgesTable, nudgeRulesTable, investmentsTable, gamificationTable } from "@workspace/db";
import {
  CreateNudgeRuleBody,
  UpdateNudgeRuleBody,
  UpdateNudgeRuleParams,
  DeleteNudgeRuleParams,
  DismissNudgeParams,
  AcceptNudgeParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/nudge-rules", async (_req, res): Promise<void> => {
  const rules = await db.select().from(nudgeRulesTable).orderBy(nudgeRulesTable.createdAt);
  res.json(rules);
});

router.post("/nudge-rules", async (req, res): Promise<void> => {
  const parsed = CreateNudgeRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rule] = await db
    .insert(nudgeRulesTable)
    .values({
      name: parsed.data.name,
      thresholdAmount: parsed.data.thresholdAmount,
      investmentType: parsed.data.investmentType,
      investmentValue: parsed.data.investmentValue,
      nudgeIntensity: parsed.data.nudgeIntensity,
      isActive: true,
    })
    .returning();

  res.status(201).json(rule);
});

router.patch("/nudge-rules/:id", async (req, res): Promise<void> => {
  const params = UpdateNudgeRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNudgeRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.thresholdAmount !== undefined) updateData.thresholdAmount = parsed.data.thresholdAmount;
  if (parsed.data.investmentType !== undefined) updateData.investmentType = parsed.data.investmentType;
  if (parsed.data.investmentValue !== undefined) updateData.investmentValue = parsed.data.investmentValue;
  if (parsed.data.nudgeIntensity !== undefined) updateData.nudgeIntensity = parsed.data.nudgeIntensity;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [rule] = await db
    .update(nudgeRulesTable)
    .set(updateData)
    .where(eq(nudgeRulesTable.id, params.data.id))
    .returning();

  if (!rule) {
    res.status(404).json({ error: "Nudge rule not found" });
    return;
  }

  res.json(rule);
});

router.delete("/nudge-rules/:id", async (req, res): Promise<void> => {
  const params = DeleteNudgeRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [rule] = await db
    .delete(nudgeRulesTable)
    .where(eq(nudgeRulesTable.id, params.data.id))
    .returning();

  if (!rule) {
    res.status(404).json({ error: "Nudge rule not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/nudges/pending", async (_req, res): Promise<void> => {
  const nudges = await db
    .select()
    .from(nudgesTable)
    .where(eq(nudgesTable.status, "pending"))
    .orderBy(nudgesTable.createdAt);

  res.json(nudges);
});

router.post("/nudges/:id/dismiss", async (req, res): Promise<void> => {
  const params = DismissNudgeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [nudge] = await db
    .update(nudgesTable)
    .set({ status: "dismissed" })
    .where(eq(nudgesTable.id, params.data.id))
    .returning();

  if (!nudge) {
    res.status(404).json({ error: "Nudge not found" });
    return;
  }

  const [gamification] = await db.select().from(gamificationTable);
  if (gamification) {
    const newPoints = gamification.totalPoints + 50;
    const newImpulsesAvoided = gamification.impulsesAvoided + 1;
    const level = computeLevel(newPoints);
    await db
      .update(gamificationTable)
      .set({
        totalPoints: newPoints,
        impulsesAvoided: newImpulsesAvoided,
        level,
      })
      .where(eq(gamificationTable.id, gamification.id));
  }

  res.json(nudge);
});

router.post("/nudges/:id/accept", async (req, res): Promise<void> => {
  const params = AcceptNudgeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [nudge] = await db
    .update(nudgesTable)
    .set({ status: "accepted" })
    .where(eq(nudgesTable.id, params.data.id))
    .returning();

  if (!nudge) {
    res.status(404).json({ error: "Nudge not found" });
    return;
  }

  await db.insert(investmentsTable).values({
    amount: nudge.suggestedInvestment,
    source: "auto",
    category: "nudge-investment",
    transactionId: nudge.transactionId,
    nudgeId: nudge.id,
    notes: "Auto-invested via nudge",
  });

  const [gamification] = await db.select().from(gamificationTable);
  if (gamification) {
    const newPoints = gamification.totalPoints + 75;
    const newInvestmentsMade = gamification.investmentsMade + 1;
    const level = computeLevel(newPoints);
    await db
      .update(gamificationTable)
      .set({
        totalPoints: newPoints,
        investmentsMade: newInvestmentsMade,
        level,
      })
      .where(eq(gamificationTable.id, gamification.id));
  }

  res.json(nudge);
});

function computeLevel(points: number): string {
  if (points >= 5000) return "Gold";
  if (points >= 2000) return "Silver";
  if (points >= 500) return "Bronze";
  return "Starter";
}

export default router;
