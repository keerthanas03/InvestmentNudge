import { pgTable, text, serial, timestamp, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const nudgeRulesTable = pgTable("nudge_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  thresholdAmount: real("threshold_amount").notNull(),
  investmentType: text("investment_type").notNull().default("percentage"),
  investmentValue: real("investment_value").notNull(),
  nudgeIntensity: text("nudge_intensity").notNull().default("gentle"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertNudgeRuleSchema = createInsertSchema(nudgeRulesTable).omit({ id: true, createdAt: true });
export type InsertNudgeRule = z.infer<typeof insertNudgeRuleSchema>;
export type NudgeRule = typeof nudgeRulesTable.$inferSelect;
