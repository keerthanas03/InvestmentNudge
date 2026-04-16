import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nudgesTable = pgTable("nudges", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  nudgeRuleId: integer("nudge_rule_id"),
  message: text("message").notNull(),
  suggestedInvestment: real("suggested_investment").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNudgeSchema = createInsertSchema(nudgesTable).omit({ id: true, createdAt: true });
export type InsertNudge = z.infer<typeof insertNudgeSchema>;
export type Nudge = typeof nudgesTable.$inferSelect;
