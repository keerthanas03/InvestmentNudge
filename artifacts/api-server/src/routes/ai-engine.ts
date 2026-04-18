import { Router, type IRouter } from "express";
import { getFullAISummary, predictOverspendingRisk } from "../services/ai-engine";
import { transactionsStore } from "../lib/in-memory-db";

const router: IRouter = Router();

// Used for AI Financial Coach UI - complete analysis
router.get("/analysis", async (req, res): Promise<void> => {
  const summary = getFullAISummary();
  res.json(summary);
});

// Used for quick predictions gauge / risk score
router.get("/predictions", async (req, res): Promise<void> => {
  const prediction = predictOverspendingRisk(transactionsStore, 100000); // Pass user salary or 100k
  res.json(prediction);
});

export default router;
