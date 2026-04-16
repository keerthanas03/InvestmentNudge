import { pgTable, serial, timestamp, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamificationTable = pgTable("gamification", {
  id: serial("id").primaryKey(),
  totalPoints: integer("total_points").notNull().default(0),
  level: text("level").notNull().default("Starter"),
  streak: integer("streak").notNull().default(0),
  impulsesAvoided: integer("impulses_avoided").notNull().default(0),
  budgetsRespected: integer("budgets_respected").notNull().default(0),
  investmentsMade: integer("investments_made").notNull().default(0),
  streakBonuses: integer("streak_bonuses").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGamificationSchema = createInsertSchema(gamificationTable).omit({ id: true, updatedAt: true });
export type InsertGamification = z.infer<typeof insertGamificationSchema>;
export type Gamification = typeof gamificationTable.$inferSelect;
