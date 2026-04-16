import { pgTable, serial, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const investmentSettingsTable = pgTable("investment_settings", {
  id: serial("id").primaryKey(),
  overspendPercent: real("overspend_percent").notNull().default(20),
  weeklyCap: real("weekly_cap").notNull().default(500),
  autoInvestEnabled: boolean("auto_invest_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInvestmentSettingsSchema = createInsertSchema(investmentSettingsTable).omit({ id: true, updatedAt: true });
export type InsertInvestmentSettings = z.infer<typeof insertInvestmentSettingsSchema>;
export type InvestmentSettings = typeof investmentSettingsTable.$inferSelect;
