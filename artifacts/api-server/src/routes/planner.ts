import { Router, type IRouter } from "express";
import { AnalyzeEmiBody } from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

// In-memory store for EMI analysis
export const emiAnalysisStore: any[] = [];

router.post("/emi-analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeEmiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request payload", details: parsed.error.issues });
    return;
  }

  const { salary, productType, cost, downPayment, tenure, interestRate } = parsed.data;

  const P = cost - downPayment;
  // If loan amount is <= 0 or tenure is <= 0
  if (P <= 0 || tenure <= 0) {
    res.json({
      emi: 0,
      safeLimit: salary * 0.2,
      risk: "SAFE",
      percentage: 0
    });
    return;
  }

  const r = interestRate / 12 / 100;
  const n = tenure;
  
  let emi = 0;
  if (r === 0) {
    emi = P / n;
  } else {
    emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const safeLimit = 0.2 * salary;
  const percentage = salary > 0 ? (emi / salary) * 100 : 0;

  let risk = "SAFE";
  if (percentage <= 20) {
    risk = "SAFE";
  } else if (percentage <= 30) {
    risk = "CAUTION";
  } else {
    risk = "DANGER";
  }

  const result = {
    emi: Math.round(emi),
    safeLimit: Math.round(safeLimit),
    risk,
    percentage: Number(percentage.toFixed(2))
  };

  // Mock save to DB (similar to Supabase)
  emiAnalysisStore.push({
    id: crypto.randomUUID(),
    user_id: "mock_user_id",
    salary,
    cost,
    downPayment,
    emi: Math.round(emi),
    risk,
    created_at: new Date().toISOString()
  });

  res.json(result);
});

export default router;
