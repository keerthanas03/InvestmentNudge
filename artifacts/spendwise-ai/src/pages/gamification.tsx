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
    <div className="space-y-10 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-tight text-[#4B5563] logo-shimmer">Gamification</h1>
        <p className="text-[#9CA3AF] font-medium mt-2 text-lg">Elevate your financial status through behavioral mastery.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FAF089]/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Level & Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-10 group relative overflow-hidden shadow-2xl border-none"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FAF089]/10 rounded-full blur-[100px] group-hover:bg-[#FAF089]/20 transition-all duration-700" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-6">
              <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#FAF089]/30 to-[#FAF089]/5 shadow-inner">
                <Trophy className="h-8 w-8 text-[#D69710]" />
              </div>
              <div>
                <p className="font-black text-xs uppercase tracking-widest text-[#9CA3AF]">Current status</p>
                <h2 className="text-4xl font-black text-[#4B5563] tracking-tighter">{gamification?.level}</h2>
              </div>
            </div>
            <div className="px-6 py-3 rounded-2xl bg-white/60 font-black text-[#D69710] shadow-sm">
              {gamification?.totalPoints?.toLocaleString() ?? 0} pts
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] opacity-60">{currentLevel.name}</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#D69710]">{nextLevel ? nextLevel.name : "Vanguard"}</span>
            </div>
            <div className="h-4 w-full bg-white/20 rounded-full overflow-hidden border border-white/30 p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#FAF089] to-[#F6AD55] rounded-full shadow-[0_0_15px_rgba(250,240,137,0.5)]"
              />
            </div>
            <p className="text-xs font-black text-[#9CA3AF] text-right tracking-tight">
              {nextLevel
                ? `${(nextLevel.min - (gamification?.totalPoints ?? 0)).toLocaleString()} pts to ascend`
                : "You have reached financial enlightenment!"}
            </p>
          </div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-10 group relative overflow-hidden shadow-2xl border-none"
        >
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#FBB6CE]/10 rounded-full blur-[100px] group-hover:bg-[#FBB6CE]/20 transition-all duration-700" />
          
          <div className="flex items-center gap-6 mb-10 relative z-10">
            <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#FBB6CE]/30 to-[#FBB6CE]/5 shadow-inner">
              <Flame className={`h-8 w-8 ${gamification?.streak ? 'text-[#FBB6CE] animate-pulse' : 'text-[#9CA3AF]'}`} />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest text-[#9CA3AF]">Retention Power</p>
              <h2 className="text-4xl font-black text-[#4B5563] tracking-tighter">{gamification?.streak} Day Streak</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-3 relative z-10">
            {[...Array(7)].map((_, i) => {
              const isActive = i < (gamification?.streak ?? 0);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? "bg-gradient-to-br from-[#FBB6CE] to-[#D6BCFA] text-white shadow-lg scale-110"
                      : "bg-white/40 text-[#9CA3AF] border border-white/50"
                  }`}
                >
                  {isActive ? <Star className="w-4 h-4" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Impulses Avoided", value: gamification?.impulsesAvoided ?? 0, icon: Zap, color: "#81E6D9", bg: "bg-[#81E6D9]/10" },
          { label: "Budgets Respected", value: gamification?.budgetsRespected ?? 0, icon: Target, color: "#D6BCFA", bg: "bg-[#D6BCFA]/10" },
          { label: "Investments Made", value: gamification?.investmentsMade ?? 0, icon: TrendingUp, color: "#FBB6CE", bg: "bg-[#FBB6CE]/10" },
          { label: "Streak Bonuses", value: gamification?.streakBonuses ?? 0, icon: Star, color: "#FAF089", bg: "bg-[#FAF089]/10" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 shadow-xl border-none group cursor-default"
          >
            <div className={`p-4 rounded-2xl ${item.bg} w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className="h-6 w-6" style={{ color: item.color }} />
            </div>
            <p className="text-4xl font-black text-[#4B5563] tracking-tighter">{item.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mt-1">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Points System */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-10 relative overflow-hidden shadow-2xl border-none"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#81E6D9]/5 via-[#D6BCFA]/5 to-[#FBB6CE]/5" />
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="p-4 rounded-2xl bg-white/60 shadow-sm">
            <Award className="h-6 w-6 text-[#A78BFA]" />
          </div>
          <h3 className="font-black text-2xl text-[#4B5563]">Point Accrual Strategy</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
          {POINTS_CONFIG.map((config, i) => (
            <motion.div
              key={config.label}
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-[2.5rem] bg-white/60 border-none shadow-sm flex flex-col items-center text-center group"
            >
              <div className="p-4 rounded-2xl bg-white mb-4 shadow-inner group-hover:scale-110 transition-all">
                <config.icon className="h-6 w-6" style={{ color: config.color.replace('text-', '') }} />
              </div>
              <p className="text-2xl font-black text-[#4B5563]">{config.points}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mt-2">{config.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-10 shadow-2xl border-none"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/60">
              <Trophy className="h-6 w-6 text-[#FBB6CE]" />
            </div>
            <h3 className="font-black text-2xl text-[#4B5563]">Global Standings</h3>
          </div>
          <Badge className="bg-[#D6BCFA] text-white font-black px-4 py-2 rounded-full border-none">Top 1% Performers</Badge>
        </div>

        {leaderboardLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FBB6CE]"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard?.map((entry, i) => (
              <motion.div
                key={entry.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className={`flex items-center justify-between p-6 rounded-[2.5rem] transition-all ${
                  entry.name === "You" 
                    ? "bg-gradient-to-r from-[#D6BCFA]/20 to-[#FBB6CE]/20 border border-white/50 shadow-lg scale-[1.02]" 
                    : "bg-white/40 hover:bg-white/60"
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className="text-2xl font-black w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 shadow-sm text-[#4B5563]">
                    {RANK_ICONS[entry.rank] ?? entry.rank}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-black text-white text-lg shadow-inner">
                        {entry.name[0]}
                    </div>
                    <div>
                        <p className={`font-black text-lg ${entry.name === "You" ? "text-[#4B5563]" : "text-[#4B5563]"}`}>
                            {entry.name}
                            {entry.name === "You" && <span className="ml-2 text-xs font-black uppercase text-[#D6BCFA]">(MVP)</span>}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <Flame className="w-3.5 h-3.5 text-orange-500" />
                            <p className="text-xs text-[#9CA3AF] font-bold">{entry.streak} day streak</p>
                        </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-[#4B5563] tracking-tight">{entry.points.toLocaleString()} pts</p>
                  <Badge className={`text-[10px] uppercase font-black tracking-widest mt-1 border-none shadow-sm ${LEVEL_COLORS[entry.level] ?? ""}`}>
                    {entry.level} Tier
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
