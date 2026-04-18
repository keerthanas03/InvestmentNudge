import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  useListInvestments, getListInvestmentsQueryKey,
  useGetInvestmentSettings, getGetInvestmentSettingsQueryKey,
  useUpdateInvestmentSettings
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Zap, Settings, LineChart as LineChartIcon, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line 
} from "recharts";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Investments() {
  const queryClient = useQueryClient();

  const { data: investments, isLoading } = useListInvestments({
    query: { queryKey: getListInvestmentsQueryKey() }
  });
  const { data: settings } = useGetInvestmentSettings({
    query: { queryKey: getGetInvestmentSettingsQueryKey() }
  });
  const updateSettings = useUpdateInvestmentSettings();

  const [localPercent, setLocalPercent] = useState<number | null>(null);
  const [localCap, setLocalCap] = useState<number | null>(null);

  const totalInvested = investments?.reduce((sum, i) => sum + i.amount, 0) ?? 0;
  const autoCount = investments?.filter(i => i.source === "auto").length ?? 0;
  const manualCount = investments?.filter(i => i.source === "manual").length ?? 0;

  // Mock OHLC data for financial charts
  const financialData = useMemo(() => {
    const data = [];
    let prevClose = 25000;
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const close = prevClose + (Math.random() - 0.45) * 800;
      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        price: Math.round(close)
      });
      prevClose = close;
    }
    return data;
  }, []);

  const handleToggleAuto = async (enabled: boolean) => {
    await updateSettings.mutateAsync({ data: { autoInvestEnabled: enabled } });
    queryClient.invalidateQueries({ queryKey: getGetInvestmentSettingsQueryKey() });
    toast.success(enabled ? "Auto-invest enabled!" : "Auto-invest disabled.");
  };

  const handleSaveSettings = async () => {
    await updateSettings.mutateAsync({
      data: {
        overspendPercent: localPercent ?? settings?.overspendPercent,
        weeklyCap: localCap ?? settings?.weeklyCap,
      }
    });
    queryClient.invalidateQueries({ queryKey: getGetInvestmentSettingsQueryKey() });
    setLocalPercent(null);
    setLocalCap(null);
    toast.success("Investment settings saved!");
  };

  const chartData = useMemo(() => {
    const sorted = investments
      ?.slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    if (!sorted || sorted.length === 0) return [];

    return sorted.reduce<{ date: string; cumulative: number }[]>((acc, inv) => {
      const date = new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const last = acc[acc.length - 1];
      acc.push({ date, cumulative: (last?.cumulative ?? 0) + inv.amount });
      return acc;
    }, []);
  }, [investments]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card border-primary/20 p-4 shadow-2xl">
          <p className="text-[10px] uppercase font-black tracking-widest opacity-60 mb-2">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <p className="text-lg font-black tracking-tighter text-primary">₹{payload[0].value.toLocaleString()}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-black tracking-tighter logo-shimmer">Investments</h1>
        <p className="text-muted-foreground mt-2 font-medium">Professional portfolio tracking and automated investment engine.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Asset Value", value: `₹${totalInvested.toLocaleString()}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50/50", change: "+12.5%" },
          { label: "Auto Redirects", value: autoCount, icon: Zap, color: "text-blue-500", bg: "bg-blue-50/50", change: "Active" },
          { label: "Alpha Growth", value: manualCount, icon: TrendingUp, color: "text-[#EC4899]", bg: "bg-pink-50/50", change: "High" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl glass-card flex items-center justify-between group hover:border-primary/20 transition-all duration-500 border-2 border-transparent"
          >
            <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${card.bg} shadow-inner group-hover:scale-110 transition-transform`}>
                  <card.icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter">{card.value}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">{card.label}</p>
                </div>
            </div>
            <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${card.color} bg-white/50 border border-current/10`}>
                {card.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Professional Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card overflow-hidden border-none shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
            <div className="space-y-1">
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary" /> Market Intelligence
                </CardTitle>
                <CardDescription className="font-bold">Alpha tracking & portfolio velocity analytics</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <Tabs defaultValue="area" className="w-full">
              <div className="flex justify-between items-center mb-6">
                  <TabsList className="bg-muted/30 p-1 rounded-xl h-10 border border-border/5">
                    <TabsTrigger value="area" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">Growth Area</TabsTrigger>
                    <TabsTrigger value="line" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs">Linear Pulse</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500 bg-rose-50/50 px-3 py-1 rounded-full animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Live Data
                  </div>
              </div>
              
              <TabsContent value="area" className="h-[400px] mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FBB6CE" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#FBB6CE" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: "#6B7280", fontWeight: 700}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: "#6B7280", fontWeight: 700}} 
                        tickFormatter={v => `₹${v/1000}k`} 
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="cumulative" stroke="#FBB6CE" fill="url(#growthGradient)" strokeWidth={4} animationBegin={0} animationDuration={1500} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="line" className="h-[400px] mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                    <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: "#6B7280", fontWeight: 700}} 
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fill: "#6B7280", fontWeight: 700}} 
                        tickFormatter={v => `₹${v/1000}k`}
                        domain={['auto', 'auto']}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#D6BCFA" 
                        strokeWidth={4} 
                        dot={false}
                        activeDot={{ r: 6, fill: "#D6BCFA", stroke: "white", strokeWidth: 2 }}
                        animationBegin={0}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Invest Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card h-full border-none shadow-xl">
            <CardHeader className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 shadow-inner">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black">Automation Core</CardTitle>
                    <CardDescription className="font-bold">Configure your behavioral investment triggers</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={settings?.autoInvestEnabled ?? false}
                  onCheckedChange={handleToggleAuto}
                  className="scale-125"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8 pt-6">
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Redirect Ratio</label>
                        <p className="text-sm font-bold text-muted-foreground">Percentage of expenditure diverted</p>
                    </div>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    {localPercent ?? settings?.overspendPercent ?? 20}%
                  </span>
                </div>
                <Slider
                  min={5}
                  max={50}
                  step={5}
                  value={[localPercent ?? settings?.overspendPercent ?? 20]}
                  onValueChange={([v]) => setLocalPercent(v)}
                  className="py-4 [&>span]:bg-primary"
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Hard Cap Pulse</label>
                        <p className="text-sm font-bold text-muted-foreground">Maximum weekly redirection limit</p>
                    </div>
                  <span className="text-3xl font-black text-primary tracking-tighter">
                    ₹{(localCap ?? settings?.weeklyCap ?? 500).toLocaleString()}
                  </span>
                </div>
                <Slider
                  min={100}
                  max={2000}
                  step={100}
                  value={[localCap ?? settings?.weeklyCap ?? 500]}
                  onValueChange={([v]) => setLocalCap(v)}
                  className="py-4"
                />
              </div>

              <Button onClick={handleSaveSettings} className="w-full h-14 glass-nav-active border-none font-black text-lg shadow-2xl scale-[1.02] mt-2">
                Save Core Configuration
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investment History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card h-full border-none shadow-xl">
            <CardHeader className="px-8 pt-8 pb-4">
              <CardTitle className="text-xl font-black">History Log</CardTitle>
              <CardDescription className="font-bold">A ledger of your wealth transformation</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : investments && investments.length > 0 ? (
                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {[...investments].reverse().map((investment, i) => (
                    <motion.div
                      key={investment.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/60 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl shadow-sm ${investment.source === "auto" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                          {investment.source === "auto" ? (
                            <Zap className="h-5 w-5 fill-current" />
                          ) : (
                            <TrendingUp className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-black capitalize group-hover:text-primary transition-colors text-base">{investment.category.replace(/-/g, " ")}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 mt-0.5">
                            {new Date(investment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {investment.source}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-emerald-600">+₹{investment.amount.toLocaleString()}</p>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-200 text-emerald-600">
                          Verified
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-muted/20 flex items-center justify-center mb-6 shadow-inner">
                    <TrendingUp className="h-10 w-10 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="font-black text-xl mb-2">No Alpha Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-[240px] mx-auto font-medium">Deploy your core guardrails to witness your wealth evolve.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
