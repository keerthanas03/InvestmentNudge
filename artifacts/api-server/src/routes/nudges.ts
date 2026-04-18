import { Router, type IRouter } from "express";
import { 
  CreateNudgeRuleBody, 
  UpdateNudgeRuleBody, 
  UpdateNudgeRuleParams, 
  DeleteNudgeRuleParams,
  DismissNudgeParams,
  AcceptNudgeParams
} from "@workspace/api-zod";
import { nudgeRulesStore, nudgesStore } from "../lib/in-memory-db";

const router: IRouter = Router();

router.get("/nudge-rules", async (_req, res): Promise<void> => {
  res.json(nudgeRulesStore);
});

router.post("/nudge-rules", async (req, res): Promise<void> => {
  const parsed = CreateNudgeRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request payload", details: parsed.error.issues });
    return;
  }

  const { data: body } = parsed;

  const newRule = {
    id: nudgeRulesStore.length + 1,
    name: body.name,
    category: body.category,
    condition: body.condition || ">",
    thresholdAmount: Number(body.thresholdAmount),
    message: body.message || "",
    ruleType: body.ruleType,
    priority: body.priority || "medium",
    investmentType: body.investmentType || "stocks",
    investmentValue: body.investmentValue || 0,
    nudgeIntensity: body.nudgeIntensity || "medium",
    isActive: true,
    createdAt: new Date().toISOString()
  };

  nudgeRulesStore.push(newRule);
  res.status(201).json(newRule);
});

router.patch("/nudge-rules/:id", async (req, res): Promise<void> => {
  const params = UpdateNudgeRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const idx = nudgeRulesStore.findIndex(r => r.id === Number(params.data.id));
  if (idx === -1) {
    res.status(404).json({ error: "Nudge rule not found" });
    return;
  }

  const body = req.body;
  nudgeRulesStore[idx] = { ...nudgeRulesStore[idx], ...body };
  res.json(nudgeRulesStore[idx]);
});

router.delete("/nudge-rules/:id", async (req, res): Promise<void> => {
  const params = DeleteNudgeRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const idx = nudgeRulesStore.findIndex(r => r.id === Number(params.data.id));
  if (idx !== -1) {
    nudgeRulesStore.splice(idx, 1);
  }
  res.sendStatus(204);
});

router.get("/nudges/pending", async (_req, res): Promise<void> => {
  res.json(nudgesStore);
});

router.post("/nudges/:id/dismiss", async (req, res): Promise<void> => {
  const params = DismissNudgeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const nudge = nudgesStore.find(n => n.id === Number(params.data.id));
  if (nudge) {
    nudge.status = "dismissed";
    res.json(nudge);
  } else {
    res.status(404).json({ error: "Nudge not found" });
  }
});

router.post("/nudges/:id/accept", async (req, res): Promise<void> => {
  const params = AcceptNudgeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const nudge = nudgesStore.find(n => n.id === Number(params.data.id));
  if (nudge) {
    nudge.status = "accepted";
    res.json(nudge);
  } else {
    res.status(404).json({ error: "Nudge not found" });
  }
});

export default router;
