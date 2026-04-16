import { Router, type IRouter } from "express";
import { db, gamificationTable } from "@workspace/db";

const router: IRouter = Router();

const LEADERBOARD = [
  { rank: 1, name: "Priya S.", points: 8450, level: "Gold", streak: 14 },
  { rank: 2, name: "Rahul M.", points: 6200, level: "Gold", streak: 7 },
  { rank: 3, name: "Anita K.", points: 4800, level: "Silver", streak: 12 },
  { rank: 4, name: "Vikram D.", points: 3200, level: "Silver", streak: 5 },
  { rank: 5, name: "Sneha P.", points: 2100, level: "Bronze", streak: 3 },
  { rank: 6, name: "You", points: 0, level: "Starter", streak: 0 },
];

router.get("/gamification", async (_req, res): Promise<void> => {
  let [gamification] = await db.select().from(gamificationTable);

  if (!gamification) {
    const [newGamification] = await db
      .insert(gamificationTable)
      .values({
        totalPoints: 150,
        level: "Starter",
        streak: 2,
        impulsesAvoided: 3,
        budgetsRespected: 1,
        investmentsMade: 2,
        streakBonuses: 0,
      })
      .returning();
    gamification = newGamification;
  }

  res.json(gamification);
});

router.get("/gamification/leaderboard", async (_req, res): Promise<void> => {
  const [gamification] = await db.select().from(gamificationTable);
  const userPoints = gamification?.totalPoints ?? 0;
  const userLevel = gamification?.level ?? "Starter";
  const userStreak = gamification?.streak ?? 0;

  const board = LEADERBOARD.map(entry => {
    if (entry.name === "You") {
      return { ...entry, points: userPoints, level: userLevel, streak: userStreak };
    }
    return entry;
  });

  board.sort((a, b) => b.points - a.points);
  const ranked = board.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  res.json(ranked);
});

export default router;
