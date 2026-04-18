import { pgTable, text, serial, timestamp, boolean, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  merchant: text("merchant").notNull(),
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  type: text("type").notNull().default("Need"), // Impulse, Need, Luxury, Investment, Waste
  status: text("status").notNull().default("normal"),
  isImpulse: boolean("is_impulse").notNull().default(false),
  nudgeTriggered: boolean("nudge_triggered").notNull().default(false),
  investmentSuggested: real("investment_suggested"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;
