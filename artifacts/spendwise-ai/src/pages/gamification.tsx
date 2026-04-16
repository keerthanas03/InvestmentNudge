import { useState } from "react";
import { motion } from "framer-motion";
import { useGetGamification, getGetGamificationQueryKey, useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Trophy, Zap, TrendingUp, Award, Flame, Star, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const LEVELS = [
  { name: "Starter", min: 0, max: 499, color: "bg-gray-400", textColor: "text-gray-600" },
  { name: "Bronze", min: 500, max: 1999, color: "bg-amber-600", textColor: "text-amber-700" },
  { name: "Silver", min: 2000, max: 4999, color: "bg-gray-400", textColor: "text-gray-500" },
  { name: "Gold", min: 5000, max: 10000, color: "bg-yellow-500", textColor: "text-yellow-600" },
];

const LEVEL_COLORS: Record<string, string> = {
  Starter: "bg-gray-100 text-gray-700 border-gray-200",
  Bronze: "bg-amber-50 text-amber-700 border-amber-200",
  Silver: "bg-slate-100 text-slate-700 border-slate-300",
  Gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const RANK_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const POINTS_CONFIG = [
  { label: "Impulse Avoided", points: "+50", icon: Zap, color: "text-green-600", bg: "bg-green-50" },
  { label: "Budget Respected", points: "+30", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Investment Made", points: "+75", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Streak Bonus", points: "+100", icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
];

export default function Gamification() {
  const { data: gamification, isLoading } = useGetGamification({
    query: { queryKey: getGetGamificationQueryKey() }
  });
  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard({
    query: { queryKey: getGetLeaderboardQueryKey() }
  });

  const currentLevel = LEVELS.find(l => gamification?.level === l.name) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressPercent = nextLevel
    ? Math.min(100, ((gamification?.totalPoints ?? 0) - currentLevel.min) / (nextLevel.min - currentLevel.min) * 100)
    : 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Gamification</h1>
        <p className="text-muted-foreground mt-1">Track your financial wellness achievements.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Level & Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <h2 className="text-2xl font-bold">{gamification?.level}</h2>
              </div>
            </div>
            <Badge className={`text-sm px-3 py-1 ${LEVEL_COLORS[gamification?.level ?? "Starter"]}`}>
              {gamification?.totalPoints?.toLocaleString() ?? 0} pts
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentLevel.name}</span>
              <span>{nextLevel ? nextLevel.name : "Max Level"}</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {nextLevel
                ? `${(nextLevel.min - (gamification?.totalPoints ?? 0)).toLocaleString()} pts to ${nextLevel.name}`
                : "Maximum level reached!"}
            </p>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-orange-50">
              <Flame className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <h2 className="text-2xl font-bold">{gamification?.streak} days</h2>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                  i < (gamification?.streak ?? 0)
                    ? "bg-orange-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}d
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Impulses Avoided", value: gamification?.impulsesAvoided ?? 0, icon: Zap, color: "text-green-600", bg: "bg-green-50" },
          { label: "Budgets Respected", value: gamification?.budgetsRespected ?? 0, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Investments Made", value: gamification?.investmentsMade ?? 0, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Streak Bonuses", value: gamification?.streakBonuses ?? 0, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="p-4 rounded-xl border border-border bg-card shadow-sm"
          >
            <div className={`p-2 rounded-lg ${item.bg} w-fit mb-3`}>
              <item.icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Points System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">How to Earn Points</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {POINTS_CONFIG.map((config, i) => (
            <motion.div
              key={config.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              className={`p-4 rounded-lg ${config.bg} border border-transparent`}
            >
              <config.icon className={`h-5 w-5 ${config.color} mb-2`} />
              <p className={`text-xl font-bold ${config.color}`}>{config.points}</p>
              <p className="text-xs text-muted-foreground mt-1">{config.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Leaderboard</h3>
        </div>
        {leaderboardLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard?.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.name === "You" ? "bg-primary/5 border border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg w-8 text-center">
                    {RANK_ICONS[entry.rank] ?? `#${entry.rank}`}
                  </span>
                  <div>
                    <p className={`font-medium ${entry.name === "You" ? "text-primary" : ""}`}>{entry.name}</p>
                    <p className="text-xs text-muted-foreground">{entry.streak} day streak</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{entry.points.toLocaleString()} pts</p>
                  <Badge className={`text-xs ${LEVEL_COLORS[entry.level] ?? ""}`}>{entry.level}</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
