import { motion } from "framer-motion";
import {
  useGetAdminStats, getGetAdminStatsQueryKey,
  useGetAdminSpendingTrends, getGetAdminSpendingTrendsQueryKey,
  useGetAdminCategoryAnalysis, getGetAdminCategoryAnalysisQueryKey
} from "@workspace/api-client-react";
import { AlertTriangle, TrendingUp, Zap, Users, BarChart2, DollarSign, Target } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const STAT_CARDS = [
  { key: "totalNudgesFired", label: "Total Nudges Fired", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
  { key: "investmentsTriggered", label: "Auto Investments", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
  { key: "totalTransactions", label: "Total Transactions", icon: BarChart2, color: "text-purple-600", bg: "bg-purple-50" },
  { key: "totalUsers", label: "Active Users", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  { key: "avgImpulseScore", label: "Avg Impulse Score", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", suffix: "%" },
  { key: "totalAmountInvested", label: "Total Invested", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", prefix: "₹" },
  { key: "nudgeAcceptanceRate", label: "Nudge Acceptance", icon: Target, color: "text-indigo-600", bg: "bg-indigo-50", suffix: "%" },
] as const;

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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide metrics and analytics.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            className="p-5 rounded-xl border border-border bg-card shadow-sm"
          >
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 rounded-lg bg-muted mb-3"></div>
                <div className="h-7 w-16 bg-muted rounded mb-2"></div>
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
            ) : (
              <>
                <div className={`p-2 rounded-lg ${card.bg} w-fit mb-3`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-bold">
                  {adminStats
                    ? formatValue(card.key, adminStats[card.key] as number, (card as any).prefix, (card as any).suffix)
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Spending Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Spending Trends (30 days)</h3>
        </div>
        {trendsLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrends ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => `₹${v.toFixed(0)}`} />
                <Legend />
                <Line type="monotone" dataKey="totalSpend" name="Total Spend" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="impulseSpend" name="Impulse" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="normalSpend" name="Normal" stroke="#22c55e" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.div>

      {/* Category Analysis Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Category Analysis</h3>
        </div>
        {categoryLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryAnalysis ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => `₹${v.toFixed(0)}`} />
                <Bar dataKey="amount" name="Amount" radius={[4, 4, 0, 0]}>
                  {categoryAnalysis?.map((entry, i) => (
                    <rect key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex flex-wrap gap-2 mt-4">
          {categoryAnalysis?.map(item => (
            <div key={item.category} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
