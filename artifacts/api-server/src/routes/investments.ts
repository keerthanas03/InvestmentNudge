import { Router, type IRouter } from "express";
import { investmentsStore, investmentSettingsStore } from "../lib/in-memory-db";

const router: IRouter = Router();

router.get("/investments", async (_req, res): Promise<void> => {
  res.json(investmentsStore);
});

router.get("/investments/settings", async (_req, res): Promise<void> => {
  res.json(investmentSettingsStore);
});

router.patch("/investments/settings", async (req, res): Promise<void> => {
  const { overspendPercent, weeklyCap, autoInvestEnabled } = req.body;

  if (overspendPercent !== undefined) investmentSettingsStore.overspendPercent = overspendPercent;
  if (weeklyCap !== undefined) investmentSettingsStore.weeklyCap = weeklyCap;
  if (autoInvestEnabled !== undefined) investmentSettingsStore.autoInvestEnabled = autoInvestEnabled;

  res.json(investmentSettingsStore);
});

export default router;
