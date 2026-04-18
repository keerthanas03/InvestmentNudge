import { Router, type IRouter } from "express";
import { transactionsStore } from "../lib/in-memory-db";
import {
  CreateTransactionBody,
  ListTransactionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const MERCHANTS = ["Amazon", "Zomato", "Uber", "Netflix", "Starbucks"];
const CATEGORIES = ["Shopping", "Food", "Travel", "Subscriptions", "Food"];

router.get("/transactions", async (req, res): Promise<void> => {
  res.json(transactionsStore);
});

router.post("/transactions", async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const newTxn = {
    id: transactionsStore.length + 1,
    ...parsed.data,
    isImpulse: parsed.data.amount > 500,
    status: parsed.data.amount > 500 ? "impulse" : "normal",
    createdAt: new Date().toISOString()
  };

  transactionsStore.unshift(newTxn);
  res.status(201).json(newTxn);
});

router.post("/transactions/simulate", async (_req, res): Promise<void> => {
  const newTxn = {
    id: transactionsStore.length + 1,
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
    amount: Math.round(Math.random() * 2000 + 100),
    isImpulse: Math.random() > 0.5,
    status: "normal",
    createdAt: new Date().toISOString()
  };
  transactionsStore.unshift(newTxn);
  res.status(201).json(newTxn);
});

export default router;
