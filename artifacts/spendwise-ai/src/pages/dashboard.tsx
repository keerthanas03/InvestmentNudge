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
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Zap, TrendingUp, ShoppingCart, Lightbulb, ArrowUpRight, PieChart as PieIcon, BarChart3, LayoutGrid } from "lucide-react";
import { useMemo } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const THEME_COLORS = {
  pink: '#FBB6CE',
  lavender: '#D6BCFA',
  teal: '#81E6D9',
  yellow: '#FAF089',
  green: '#9AE6B4'
};

const CHART_GLASS_COLORS = [
  'rgba(251, 182, 206, 0.7)',  // Pink Glass
  'rgba(214, 188, 250, 0.7)',  // Lavender Glass
  'rgba(129, 230, 217, 0.7)',  // Teal Glass
  'rgba(250, 240, 137, 0.7)',  // Yellow Glass
  'rgba(154, 230, 180, 0.7)',  // Green Glass
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 100 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 }
  }
};

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

  const lineChartData = useMemo(() => {
    return {
      labels: spendingTrend?.map(d => d.date) || [],
      datasets: [
        {
          label: 'Total Spend',
          data: spendingTrend?.map(d => d.totalSpend) || [],
          borderColor: THEME_COLORS.lavender,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
            gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
            return gradient;
          },
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 4,
        },
        {
          label: 'Impulse Spend',
          data: spendingTrend?.map(d => d.impulseSpend) || [],
          borderColor: THEME_COLORS.pink,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        }
      ]
    };
  }, [spendingTrend]);

  const pieChartData = useMemo(() => {
    return {
      labels: categoryBreakdown?.map(c => c.category) || [],
      datasets: [{
        data: categoryBreakdown?.map(c => c.amount) || [],
        backgroundColor: CHART_GLASS_COLORS,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        hoverOffset: 30,
        borderRadius: 10,
        spacing: 5,
        cutout: '70%',
      }]
    };
  }, [categoryBreakdown]);

  const barChartData = useMemo(() => {
    const topCategories = [...(categoryBreakdown || [])].sort((a, b) => b.amount - a.amount).slice(0, 5);
    return {
      labels: topCategories.map(c => c.category),
      datasets: [{
        label: 'Category Spend',
        data: topCategories.map(c => c.amount),
        backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            const baseColor = CHART_GLASS_COLORS[context.dataIndex % CHART_GLASS_COLORS.length];
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(1, baseColor.replace('0.7', '0.2'));
            return gradient;
        },
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      }]
    };
  }, [categoryBreakdown]);

  const insights = useMemo(() => {
    if (!categoryBreakdown || !summary) return [];
    const items = [];
    
    const highest = [...categoryBreakdown].sort((a, b) => b.amount - a.amount)[0];
    if (highest) {
        items.push({
            title: "Spending Insight",
            message: `Your highest spending is on ${highest.category} (₹${highest.amount.toFixed(0)})`,
            icon: ArrowUpRight,
            type: "info"
        });
    }

    const impulseTotal = categoryBreakdown
      .filter(c => ["Food & Dining", "Shopping", "Entertainment"].includes(c.category))
      .reduce((sum, c) => sum + c.amount, 0);
    
    if (impulseTotal > 5000) {
        items.push({
            title: "Impulse Alert",
            message: `You spent ₹${impulseTotal.toFixed(0)} on impulse categories this month. Try investing ₹1,500 instead!`,
            icon: Zap,
            type: "warning"
        });
    }

    const subs = categoryBreakdown.find(c => c.category === "Subscriptions");
    if (subs && subs.amount > 1000) {
        items.push({
            title: "Optimization",
            message: `You have ₹${subs.amount.toFixed(0)} in subscriptions. Consider cancelling unused ones.`,
            icon: Lightbulb,
            type: "success"
        });
    }

    return items;
  }, [categoryBreakdown, summary]);

  if (isLoadingSummary || isLoadingTrend || isLoadingCategory) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <Skeleton className="h-[500px] rounded-3xl" />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-12"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-5xl font-black tracking-tight text-[#4B5563] logo-shimmer">Overview</h1>
        <p className="text-[#9CA3AF] font-medium mt-2 text-lg">Personalized financial insights and investment nudges.</p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard title="Today's Spend" value={`₹${summary?.todaySpend?.toFixed(0) || "0"}`} icon={ShoppingCart} color="teal" />
        <MetricCard title="Total Invested" value={`₹${summary?.totalInvested?.toFixed(0) || "0"}`} icon={TrendingUp} color="pink" />
        <MetricCard title="Impulse Ratio" value={`${((summary?.impulseScore || 0) / 100 * 100).toFixed(0)}%`} icon={Zap} color="yellow" />
        <MetricCard title="Active Nudges" value={summary?.activeAlerts || 0} icon={BellCircle} color="lavender" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nudge Center */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="glass-card h-full border-none shadow-2xl p-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-black">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-orange-600" />
                </div>
                Nudge Center
              </CardTitle>
              <CardDescription className="text-[#6B7280] font-bold">Engineered behavioral insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <AnimatePresence>
                {insights.map((nudge, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-5 rounded-[2rem] border-none shadow-lg flex gap-4 transition-all hover:scale-[1.02] cursor-default ${
                            nudge.type === 'warning' ? 'bg-orange-50/70' : 
                            nudge.type === 'success' ? 'bg-emerald-50/70' : 
                            'bg-blue-50/70'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center ${
                             nudge.type === 'warning' ? 'bg-orange-200 text-orange-700' : 
                             nudge.type === 'success' ? 'bg-emerald-200 text-emerald-700' : 
                             'bg-blue-200 text-blue-700'
                        }`}>
                            <nudge.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-xs uppercase tracking-widest opacity-60 mb-1">{nudge.title}</p>
                            <p className="text-sm text-[#4B5563] font-bold leading-relaxed">{nudge.message}</p>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Container */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="card-pop-in">
          <Card className="glass-card overflow-hidden border-none shadow-2xl p-6">
            <h3 className="text-xl font-black mb-6">Spending Trend</h3>
            <div className="h-[300px]">
              <Line 
                data={lineChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: {
                    duration: 2000,
                    easing: 'easeOutQuart',
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      titleColor: '#1F2937',
                      bodyColor: '#1F2937',
                      padding: 12,
                      cornerRadius: 16,
                      displayColors: false,
                    }
                  },
                  scales: {
                    y: { display: false },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </Card>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <motion.div variants={itemVariants} className="card-pop-in">
              <Card className="glass-card border-none shadow-2xl p-6 h-full relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#A78BFA]/5 rounded-full blur-3xl group-hover:bg-[#A78BFA]/10 transition-colors duration-700" />
                <h3 className="text-sm font-black uppercase tracking-widest text-[#9CA3AF] mb-6 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-[#D6BCFA]" />
                    Spatial Allocation
                </h3>
                <div className="h-[250px] flex items-center justify-center relative">
                    <Doughnut 
                        data={pieChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 2500,
                                easing: 'easeOutQuart',
                            },
                            plugins: {
                                legend: { 
                                    position: 'bottom', 
                                    labels: { 
                                        padding: 20, 
                                        usePointStyle: true, 
                                        boxWidth: 8, 
                                        font: { weight: 'bold', size: 10 },
                                        color: '#6B7280'
                                    } 
                                },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    titleColor: '#1F2937',
                                    bodyColor: '#1F2937',
                                    padding: 12,
                                    cornerRadius: 16,
                                    displayColors: true,
                                    borderColor: 'rgba(167, 139, 250, 0.2)',
                                    borderWidth: 1,
                                }
                            },
                        }}
                    />
                    <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#9CA3AF]">Total</span>
                        <span className="text-xl font-black text-[#4B5563]">
                            ₹{categoryBreakdown?.reduce((s, c) => s + c.amount, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>
              </Card>
             </motion.div>
             <motion.div variants={itemVariants} className="card-pop-in">
              <Card className="glass-card border-none shadow-2xl p-6 h-full relative overflow-hidden group">
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#EC4899]/5 rounded-full blur-3xl group-hover:bg-[#EC4899]/10 transition-colors duration-700" />
                <h3 className="text-sm font-black uppercase tracking-widest text-[#9CA3AF] mb-6 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FBB6CE]" />
                    Top Categories
                </h3>
                <div className="h-[250px]">
                    <Bar 
                        data={barChartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            indexAxis: 'y',
                            animation: {
                                duration: 2500,
                                easing: 'easeOutQuart',
                            },
                            plugins: { 
                                legend: { display: false },
                                tooltip: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    titleColor: '#1F2937',
                                    bodyColor: '#1F2937',
                                    padding: 12,
                                    cornerRadius: 16,
                                    borderColor: 'rgba(251, 182, 206, 0.2)',
                                    borderWidth: 1,
                                }
                            },
                            scales: {
                                y: { 
                                    grid: { display: false },
                                    ticks: { font: { weight: 'bold', size: 11 }, color: '#6B7280' }
                                },
                                x: { display: false }
                            }
                        }}
                    />
                </div>
              </Card>
             </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
    const colors: any = {
        teal: "bg-[#81E6D9] shadow-[0_8px_32px_rgba(129,230,217,0.2)]",
        pink: "bg-[#FBB6CE] shadow-[0_8px_32px_rgba(251,182,206,0.2)]",
        yellow: "bg-[#FAF089] shadow-[0_8px_32px_rgba(250,240,137,0.2)]",
        lavender: "bg-[#D6BCFA] shadow-[0_8px_32px_rgba(214,188,250,0.2)]",
        green: "bg-[#9AE6B4] shadow-[0_8px_32px_rgba(154,230,180,0.2)]"
    };

    return (
        <motion.div variants={itemVariants} className="card-pop-in">
            <Card className="glass-card group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all p-1">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardDescription className="uppercase font-black text-[10px] tracking-widest text-[#6B7280] group-hover:text-[#EC4899] transition-colors">{title}</CardDescription>
                        <motion.div 
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${colors[color]}`}
                        >
                            <Icon className="w-5 h-5" />
                        </motion.div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-black tracking-tighter text-[#4B5563]">{value}</div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

const BellCircle = ({ className }: any) => (
    <div className={className}>
        <div className="relative">
            <div className="w-5 h-5 rounded-full border-2 border-current" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-current rounded-full" />
        </div>
    </div>
);
