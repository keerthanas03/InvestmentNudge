import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useGetSpendingTrend,
  getGetSpendingTrendQueryKey,
  useGetCategoryBreakdown,
  getGetCategoryBreakdownQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  const { data: spendingTrend, isLoading: isLoadingTrend } = useGetSpendingTrend({
    query: { queryKey: getGetSpendingTrendQueryKey() },
  });

  const { data: categoryBreakdown, isLoading: isLoadingCategory } = useGetCategoryBreakdown({
    query: { queryKey: getGetCategoryBreakdownQueryKey() },
  });

  if (isLoadingSummary || isLoadingTrend || isLoadingCategory) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const impulseScoreData = [
    { name: "Score", value: summary?.impulseScore || 0, fill: "hsl(var(--primary))" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground mt-2">Your financial co-pilot overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Today's Spend" value={`₹${summary?.todaySpend?.toFixed(0) || "0"}`} delay={0.1} />
        <MetricCard title="Total Invested" value={`₹${summary?.totalInvested?.toFixed(0) || "0"}`} delay={0.2} />
        <MetricCard title="Impulse Score" value={`${summary?.impulseScore || 0}/100`} delay={0.3} />
        <MetricCard title="Active Alerts" value={summary?.activeAlerts || 0} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Daily spend vs impulse spend over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line type="monotone" dataKey="totalSpend" name="Total Spend" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="impulseSpend" name="Impulse Spend" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Where your money is going</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {categoryBreakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number) => [`₹${value.toFixed(0)}`, "Amount"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 h-full flex flex-col justify-center space-y-2 overflow-y-auto pr-2">
                {categoryBreakdown?.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color || "hsl(var(--primary))" }} />
                      <span className="truncate max-w-[100px]">{entry.category}</span>
                    </div>
                    <span className="font-medium">₹{entry.amount.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7, duration: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Category Spending</CardTitle>
              <CardDescription>Amounts spent per category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBreakdown} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                  />
                  <Bar dataKey="amount" name="Spent" radius={[0, 4, 4, 0]}>
                    {categoryBreakdown?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, duration: 0.4 }}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Impulse Control</CardTitle>
              <CardDescription>Your impulse resistance score</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="70%"
                  outerRadius="90%"
                  barSize={15}
                  data={impulseScoreData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: "hsl(var(--secondary))" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-10">
                <span className="text-4xl font-bold">{summary?.impulseScore || 0}</span>
                <span className="text-sm text-muted-foreground mt-1">/ 100 Score</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, delay }: { title: string; value: string | number; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
