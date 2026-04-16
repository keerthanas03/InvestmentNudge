import { Router, type IRouter } from "express";
import { db, investmentsTable, investmentSettingsTable } from "@workspace/db";
import {
  UpdateInvestmentSettingsBody,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/investments", async (_req, res): Promise<void> => {
  const investments = await db
    .select()
    .from(investmentsTable)
    .orderBy(investmentsTable.createdAt);

  res.json(investments);
});

router.get("/investments/settings", async (_req, res): Promise<void> => {
  let [settings] = await db.select().from(investmentSettingsTable);

  if (!settings) {
    const [newSettings] = await db
      .insert(investmentSettingsTable)
      .values({ overspendPercent: 20, weeklyCap: 500, autoInvestEnabled: false })
      .returning();
    settings = newSettings;
  }

  res.json(settings);
});

router.patch("/investments/settings", async (req, res): Promise<void> => {
  const parsed = UpdateInvestmentSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [settings] = await db.select().from(investmentSettingsTable);

  if (!settings) {
    const [newSettings] = await db
      .insert(investmentSettingsTable)
      .values({ overspendPercent: 20, weeklyCap: 500, autoInvestEnabled: false })
      .returning();
    settings = newSettings;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.overspendPercent !== undefined) updateData.overspendPercent = parsed.data.overspendPercent;
  if (parsed.data.weeklyCap !== undefined) updateData.weeklyCap = parsed.data.weeklyCap;
  if (parsed.data.autoInvestEnabled !== undefined) updateData.autoInvestEnabled = parsed.data.autoInvestEnabled;

  const [updated] = await db
    .update(investmentSettingsTable)
    .set(updateData)
    .where(eq(investmentSettingsTable.id, settings.id))
    .returning();

  res.json(updated);
});

export default router;
