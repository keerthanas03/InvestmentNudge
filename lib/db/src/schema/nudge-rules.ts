import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nudgeRulesTable = pgTable("nudge_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  condition: text("condition").notNull().default(">"),
  thresholdAmount: real("threshold_amount").notNull(),
  message: text("message").notNull(),
  ruleType: text("rule_type").notNull(), // Impulse / Need / Investment / Luxury / Waste
  priority: text("priority").notNull().default("medium"), // high, medium, low
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNudgeRuleSchema = createInsertSchema(nudgeRulesTable).omit({ id: true, createdAt: true });
export type InsertNudgeRule = z.infer<typeof insertNudgeRuleSchema>;
export type NudgeRule = typeof nudgeRulesTable.$inferSelect;
