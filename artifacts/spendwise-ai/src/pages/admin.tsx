import { motion } from "framer-motion";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useGetAdminSpendingTrends, getGetAdminSpendingTrendsQueryKey,
  useGetAdminCategoryAnalysis, getGetAdminCategoryAnalysisQueryKey
} from "@workspace/api-client-react";
import { AlertTriangle, TrendingUp, Zap, Users, BarChart2, DollarSign, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

const STAT_CARDS = [
  { key: "totalNudgesFired", label: "Total Nudges", icon: Zap, color: "#81E6D9", bg: "bg-[#81E6D9]/15" },
  { key: "investmentsTriggered", label: "Auto-Invest", icon: TrendingUp, color: "#D6BCFA", bg: "bg-[#D6BCFA]/15" },
  { key: "totalTransactions", label: "Flow Count", icon: BarChart2, color: "#FBB6CE", bg: "bg-[#FBB6CE]/15" },
  { key: "totalUsers", label: "Active Nodes", icon: Users, color: "#FAF089", bg: "bg-[#FAF089]/15" },
  { key: "avgImpulseScore", label: "Risk Index", icon: AlertTriangle, color: "#FC8181", bg: "bg-[#FC8181]/15", suffix: "%" },
  { key: "totalAmountInvested", label: "Wealth Locked", icon: DollarSign, color: "#9AE6B4", bg: "bg-[#9AE6B4]/15", prefix: "₹" },
  { key: "nudgeAcceptanceRate", label: "Sync Rate", icon: Target, color: "#A78BFA", bg: "bg-[#A78BFA]/15", suffix: "%" },
] as const;

const CHART_PALE_COLORS = [
  'rgba(129, 230, 217, 0.6)',  // Teal
  'rgba(214, 188, 250, 0.6)',  // Lavender
  'rgba(251, 182, 206, 0.6)',  // Pink
  'rgba(250, 240, 137, 0.6)',  // Yellow
  'rgba(154, 230, 180, 0.6)',  // Green
];

type StatKey = typeof STAT_CARDS[number]["key"];

export default function Admin() {
  const { data: adminStats, isLoading: statsLoading } = useGetAdminStats({
    query: { queryKey: getGetAdminStatsQueryKey() }
  });
  const { data: spendingTrends, isLoading: trendsLoading } = useGetAdminSpendingTrends({
    query: { queryKey: getGetAdminSpendingTrendsQueryKey() }
  });
  const { data: categoryAnalysis, isLoading: categoryLoading } = useGetAdminCategoryAnalysis({
    query: { queryKey: getGetAdminCategoryAnalysisQueryKey() }
  });

  const formatValue = (key: StatKey, value: number, prefix?: string, suffix?: string) => {
    const formatted = key === "totalAmountInvested"
      ? value.toFixed(0)
      : key === "avgImpulseScore" || key === "nudgeAcceptanceRate"
      ? value.toFixed(1)
      : value.toString();
    return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
  };

  return (
    <div className="space-y-10 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-tight text-[#4B5563] logo-shimmer">Admin Dashboard</h1>
        <p className="text-[#9CA3AF] font-medium mt-2 text-lg">Real-time platform-wide cognitive health analytics.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            whileHover={{ y: -5 }}
            className="p-6 glass-card border-none shadow-xl transition-all"
          >
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/40 mb-4"></div>
                <div className="h-8 w-20 bg-white/40 rounded mb-2"></div>
                <div className="h-3 w-24 bg-white/40 rounded"></div>
              </div>
            ) : (
              <>
                <div className={`p-4 rounded-2xl ${card.bg} w-fit mb-4`}>
                  <card.icon className="h-6 w-6" style={{ color: card.color }} />
                </div>
                <p className="text-4xl font-black text-[#4B5563] tracking-tighter">
                  {adminStats
                    ? formatValue(card.key, adminStats[card.key] as number, (card as any).prefix, (card as any).suffix)
                    : "—"}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] mt-1">{card.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#A78BFA]/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Spending Trends Chart */}
        <motion.div
           initial={{ opacity: 0, y: 100, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 15 }}
          className="glass-card p-10 relative overflow-hidden shadow-2xl border-none group"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#81E6D9]/5 rounded-full blur-[100px] group-hover:bg-[#81E6D9]/10 transition-all duration-700" />
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-4 rounded-2xl bg-white/60 shadow-sm">
              <TrendingUp className="h-6 w-6 text-[#81E6D9]" />
            </div>
            <h3 className="font-black text-2xl text-[#4B5563]">Systemic Liquidity</h3>
          </div>
          {trendsLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81E6D9]"></div>
            </div>
          ) : (
            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrends ?? []}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#81E6D9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#81E6D9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorImpulse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FC8181" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#FC8181" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF", fontBold: "900" }}
                    tickFormatter={d => d.slice(5)}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF", fontBold: "900" }} 
                    tickFormatter={v => `₹${v}`} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        padding: '16px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: '900' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalSpend" 
                    name="Global Flow" 
                    stroke="#81E6D9" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="impulseSpend" 
                    name="Risk Vector" 
                    stroke="#FC8181" 
                    strokeWidth={2} 
                    strokeDasharray="8 4"
                    fillOpacity={1} 
                    fill="url(#colorImpulse)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Category Analysis Chart */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 80, damping: 15 }}
          className="glass-card p-10 relative overflow-hidden shadow-2xl border-none group"
        >
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[#A78BFA]/5 rounded-full blur-[100px] group-hover:bg-[#A78BFA]/10 transition-all duration-700" />
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <div className="p-4 rounded-2xl bg-white/60 shadow-sm">
              <BarChart2 className="h-6 w-6 text-[#A78BFA]" />
            </div>
            <h3 className="font-black text-2xl text-[#4B5563]">Categorical Density</h3>
          </div>
          {categoryLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A78BFA]"></div>
            </div>
          ) : (
            <div className="h-[300px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalysis ?? []}>
                  <XAxis 
                    dataKey="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF", fontBold: "900" }} 
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9CA3AF", fontBold: "900" }} 
                    tickFormatter={v => `₹${v}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.2)' }}
                    contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        borderRadius: '24px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        padding: '16px'
                    }}
                  />
                  <Bar dataKey="amount" name="Volume" radius={[12, 12, 0, 0]} animationBegin={500} animationDuration={2000} animationEasing="ease-out">
                    {(categoryAnalysis ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_PALE_COLORS[index % CHART_PALE_COLORS.length]} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
