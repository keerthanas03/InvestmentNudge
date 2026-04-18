import { Router, type IRouter } from "express";
import { categoriesStore } from "../lib/in-memory-db";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  res.json(categoriesStore);
});

router.patch("/categories/:id", async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const idx = categoriesStore.findIndex(c => c.id === id);
  if (idx !== -1) {
    categoriesStore[idx] = { ...categoriesStore[idx], ...req.body };
    res.json(categoriesStore[idx]);
  } else {
    res.status(404).json({ error: "Category not found" });
  }
});

export default router;
