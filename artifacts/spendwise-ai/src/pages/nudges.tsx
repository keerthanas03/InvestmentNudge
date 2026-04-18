import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListNudgeRules, 
  getListNudgeRulesQueryKey,
  useCreateNudgeRule, 
  useUpdateNudgeRule, 
  useDeleteNudgeRule,
  useGetCategoryBreakdown,
  useListPendingNudges,
  getListPendingNudgesQueryKey,
  useDismissNudge,
  useAcceptNudge
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
    Zap, Plus, Trash2, CheckCircle, X, Bell, Settings, 
    ShieldCheck, AlertTriangle, TrendingUp, Sparkles, 
    ArrowRightLeft, Target, Info, Flame, PieChart as PieChartIcon, 
    Activity, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Progress } from "@/components/ui/progress";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const RULE_TEMPLATES = [
    { name: "Reduce Swiggy Usage", category: "Food & Dining", amount: 2000, type: "Impulse", message: "Redirecting Swiggy spend to Sip" },
    { name: "Subscription Audit", category: "Subscriptions", amount: 800, type: "Waste", message: "Cancel unused streaming apps" },
    { name: "Manual Investment", category: "Investments", amount: 5000, condition: "<", type: "Investment", message: "Monthly accumulation target shortfall" }
];

const MOCK_IMPACT_DATA = [
    { day: 'Mon', redirected: 450 },
    { day: 'Tue', redirected: 1200 },
    { day: 'Wed', redirected: 300 },
    { day: 'Thu', redirected: 2100 },
    { day: 'Fri', redirected: 800 },
    { day: 'Sat', redirected: 4500 },
    { day: 'Sun', redirected: 1800 },
];

export default function Nudges() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: nudgeRules, isLoading: rulesLoading } = useListNudgeRules({
    query: { queryKey: getListNudgeRulesQueryKey() }
  });
  const { data: categoryBreakdown, isLoading: breakdownLoading } = useGetCategoryBreakdown();
  
  const { data: pendingNudges } = useListPendingNudges({
    query: { queryKey: getListPendingNudgesQueryKey() }
  });

  const createRule = useCreateNudgeRule();
  const deleteRule = useDeleteNudgeRule();
  const updateRule = useUpdateNudgeRule();
  const acceptNudge = useAcceptNudge();
  const dismissNudge = useDismissNudge();

  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      condition: ">",
      thresholdAmount: 1000,
      message: "",
      ruleType: "Impulse",
      priority: "medium",
      investmentType: "stocks",
      investmentValue: 0,
      nudgeIntensity: "medium"
    }
  });

  const handleCreateRule = async (values: any) => {
    if (!values.name || !values.category || !values.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
        ...values,
        thresholdAmount: Number(values.thresholdAmount),
        investmentValue: Number(values.investmentValue)
    };

    await createRule.mutateAsync({ data: payload });
    queryClient.invalidateQueries({ queryKey: getListNudgeRulesQueryKey() });
    toast.success("Active Guardrail Deployed");
    setIsDialogOpen(false);
    form.reset();
  };

  const applyTemplate = (template: typeof RULE_TEMPLATES[0]) => {
    form.setValue("name", template.name);
    form.setValue("category", template.category);
    form.setValue("thresholdAmount", template.amount as any);
    form.setValue("ruleType", template.type);
    form.setValue("message", template.message);
    form.setValue("investmentType", "stocks");
    form.setValue("investmentValue", 100);
    form.setValue("nudgeIntensity", "medium");
  };

  const triggeredRulesCount = useMemo(() => {
    if (!nudgeRules || !categoryBreakdown) return 0;
    return nudgeRules.filter(rule => {
        const spent = categoryBreakdown.find(c => c.category.toLowerCase() === rule.category.toLowerCase())?.amount || 0;
        return rule.condition === ">" ? spent > rule.thresholdAmount : spent < rule.thresholdAmount;
    }).length;
  }, [nudgeRules, categoryBreakdown]);

  const distributionData = useMemo(() => {
    if (!nudgeRules) return [];
    const counts: Record<string, number> = {};
    nudgeRules.forEach(r => {
        counts[r.ruleType] = (counts[r.ruleType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [nudgeRules]);

  const COLORS = ['#FBB6CE', '#D6BCFA', '#81E6D9', '#FAF089', '#9AE6B4'];

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter logo-shimmer">Nudge Engine</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 uppercase tracking-widest opacity-60">Behavioral Automation Core</p>
        </div>
        <div className="flex gap-3">
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="glass-nav-active border-none scale-105 shadow-xl">
                        <Plus className="w-5 h-5 mr-2" /> Define Guardrail
                    </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Configure Nudge Rule</DialogTitle>
                        <CardDescription>Rules that turn spending events into wealth triggers.</CardDescription>
                    </DialogHeader>
                    
                    <div className="pt-4 space-y-4">
                        <div className="flex gap-2">
                             {RULE_TEMPLATES.map(t => (
                                 <Button key={t.name} variant="outline" size="sm" className="text-[10px] h-7 font-bold rounded-lg" onClick={() => applyTemplate(t)}>
                                    <Sparkles className="w-3 h-3 mr-1" /> {t.name}
                                 </Button>
                             ))}
                        </div>

                        <form onSubmit={form.handleSubmit(handleCreateRule)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs">Rule Name</Label>
                                    <Input {...form.register("name")} className="glass-card h-10" placeholder="e.g. Swiggy Guard" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs">Category</Label>
                                    <div className="space-y-1">
                                      <Input {...form.register("category")} className="glass-card h-10" placeholder="Enter category" />
                                      <p className="text-[10px] text-muted-foreground font-medium ml-1">Examples: Food, Transport, Shopping</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-1">
                                    <Label className="font-bold text-xs">Condition</Label>
                                    <div className="space-y-1">
                                      <Input {...form.register("condition")} className="glass-card h-10" placeholder="> or <" />
                                      <p className="text-[9px] text-muted-foreground">Type &gt; or &lt;</p>
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="font-bold text-xs">Amount (₹)</Label>
                                    <Input type="number" {...form.register("thresholdAmount")} className="glass-card h-10 font-bold" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-xs">Rule Tag</Label>
                                <div className="space-y-1">
                                  <Input {...form.register("ruleType")} className="glass-card h-10" placeholder="e.g. Impulse, Need, Luxury" />
                                  <p className="text-[9px] text-muted-foreground">Examples: Impulse, Need, Investment, Luxury, Waste</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs">Investment Target</Label>
                                    <div className="space-y-1">
                                      <Input {...form.register("investmentType")} className="glass-card h-9" placeholder="e.g. stocks" />
                                      <p className="text-[9px] text-muted-foreground">e.g. stocks, crypto, gold</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-xs">Intended Amount (₹)</Label>
                                    <Input type="number" {...form.register("investmentValue")} className="glass-card h-9 font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs">Intensity</Label>
                                <div className="space-y-1">
                                  <Input {...form.register("nudgeIntensity")} className="glass-card h-10" placeholder="e.g. medium" />
                                  <p className="text-[9px] text-muted-foreground font-medium">Low, Medium, High</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-xs">Nudge Message</Label>
                                <Input {...form.register("message")} className="glass-card" placeholder="How should we nudge you?" />
                            </div>
                            <Button type="submit" className="w-full h-12 glass-nav-active border-none font-black text-lg shadow-lg">Activate Engine</Button>
                        </form>
                    </div>
                </DialogContent>
             </Dialog>
        </div>
      </motion.div>

      {/* Analytics Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card col-span-1 lg:col-span-2 overflow-hidden border-none shadow-xl">
              <CardHeader className="pb-2 px-6 pt-6">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" /> Diversion Velocity
                  </CardTitle>
                  <CardDescription>Estimated daily amount redirected to wealth building.</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] pt-4 px-6 pb-6">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_IMPACT_DATA}>
                          <defs>
                              <linearGradient id="colorRedirect" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FBB6CE" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#FBB6CE" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                          <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} 
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#6B7280' }} 
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="redirected" 
                            stroke="#FBB6CE" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRedirect)" 
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          />
                      </AreaChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden border-none shadow-xl h-[330px]">
              <CardHeader className="pb-2 px-6 pt-6">
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-primary" /> Rule Distribution
                  </CardTitle>
                  <CardDescription>Composition of active guardrails.</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px] flex flex-col justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                            data={distributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {distributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase' }} />
                      </PieChart>
                  </ResponsiveContainer>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Engine Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-bold flex items-center gap-2">
                              <Activity className="w-4 h-4 text-emerald-500" /> Active Pulse
                          </span>
                          <span className="text-2xl font-black">{nudgeRules?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-rose-600">Breaches</span>
                          <span className="text-2xl font-black text-rose-600 animate-pulse">{triggeredRulesCount}</span>
                      </div>
                      <Progress value={(triggeredRulesCount / (nudgeRules?.length || 1)) * 100} className="h-2 [&>div]:bg-rose-500" />
                  </CardContent>
              </Card>

              <Card className="glass-card">
                  <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="p-4 rounded-2xl bg-muted/20 border flex gap-3 items-start">
                          <Info className="w-4 h-4 text-blue-500 mt-1" />
                          <p className="text-[11px] font-bold leading-tight">Setting nudges for custom categories yields 24% higher wealth accumulation on average.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-orange-50/50 border-orange-100 border flex gap-3 items-start">
                          <Flame className="w-4 h-4 text-orange-500 mt-1" />
                          <div className="flex-1">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Hot Category</p>
                              <p className="text-xs font-black uppercase">Food & Dining</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
              {pendingNudges && pendingNudges.length > 0 && (
                  <div className="space-y-4">
                      <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                          <Bell className="w-4 h-4 text-rose-500" /> Live Redirects
                      </h3>
                      <AnimatePresence>
                          {pendingNudges.map((n, i) => (
                              <motion.div 
                                key={n.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card border-rose-200 bg-rose-50/10 p-5 flex items-center justify-between gap-6"
                              >
                                  <div className="flex items-center gap-4 flex-1">
                                      <div className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
                                          <Zap className="w-6 h-6 fill-current" />
                                      </div>
                                      <div>
                                          <p className="font-black text-lg leading-tight">{n.message}</p>
                                          <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider flex items-center gap-2">
                                              <ArrowRightLeft className="w-3 h-3" /> Re-route ₹{n.suggestedInvestment?.toLocaleString()} to ELSS Portfolio
                                          </p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <Button variant="ghost" size="sm" className="font-bold hover:bg-rose-100 hover:text-rose-600" onClick={() => dismissNudge.mutate({ id: n.id })}>Dismiss</Button>
                                      <Button size="sm" className="bg-rose-600 hover:bg-rose-700 font-bold px-6 shadow-lg shadow-rose-100" onClick={() => acceptNudge.mutate({ id: n.id })}>Invest now</Button>
                                  </div>
                              </motion.div>
                          ))}
                      </AnimatePresence>
                  </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nudgeRules?.map((rule, i) => {
                      const spent = categoryBreakdown?.find(c => c.category.toLowerCase() === rule.category.toLowerCase())?.amount || 0;
                      const isTriggered = rule.condition === ">" ? spent > rule.thresholdAmount : spent < rule.thresholdAmount;

                      return (
                        <motion.div 
                            key={rule.id}
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={`glass-card relative overflow-hidden group border-2 ${isTriggered ? 'border-rose-300 shadow-lg shadow-rose-50' : 'border-border/10 hover:border-primary/20'}`}>
                                <div className={`absolute top-0 right-0 p-3 text-[8px] font-black uppercase tracking-widest ${isTriggered ? 'text-rose-600 font-black' : 'text-muted-foreground opacity-40'}`}>
                                    {isTriggered ? 'Triggered' : 'Monitoring'}
                                </div>
                                <CardHeader className="pb-3 px-6 pt-6">
                                    <div className="flex items-center gap-3">
                                        <Badge className={`rounded-xl px-3 py-1 uppercase font-black text-[9px] ${
                                            rule.ruleType?.toLowerCase() === 'impulse' ? 'bg-orange-500 text-white' : 
                                            rule.ruleType?.toLowerCase() === 'need' ? 'bg-blue-500 text-white' : 
                                            rule.ruleType?.toLowerCase() === 'investment' ? 'bg-emerald-500 text-white' : 
                                            'bg-purple-500 text-white'
                                        }`}>
                                            {rule.ruleType}
                                        </Badge>
                                        <CardTitle className="text-base font-black truncate">{rule.name}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-6 pb-6 space-y-4">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[9px] font-black uppercase text-muted-foreground opacity-60 flex items-center gap-1">
                                                <Activity className="w-3 h-3" /> Current Exposure
                                            </p>
                                            <p className="text-xl font-black tabular-nums">₹{spent.toLocaleString()} / <span className="opacity-40">₹{rule.thresholdAmount.toLocaleString()}</span></p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-xl" onClick={() => deleteRule.mutate({ id: rule.id })}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        <Progress value={Math.min((spent / rule.thresholdAmount) * 100, 100)} className={`h-2 rounded-full ${isTriggered ? '[&>div]:bg-rose-500' : '[&>div]:bg-primary'}`} />
                                        <div className="p-3 rounded-xl bg-muted/5 border border-border/5">
                                             <p className="text-[10px] font-bold text-muted-foreground leading-tight italic">"{rule.message}"</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                      );
                  })}
              </div>

              {nudgeRules?.length === 0 && (
                   <div className="py-24 text-center glass-card border-dashed">
                       <Target className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10 animate-pulse" />
                       <h3 className="text-2xl font-black text-muted-foreground">Engine Core Offline</h3>
                       <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm mx-auto">Initialize behavioral guardrails to enable real-time wealth diversion.</p>
                       <Button className="mt-8 glass-nav-active border-none shadow-2xl px-12 h-14 text-lg font-black" onClick={() => setIsDialogOpen(true)}>Initialize Engine Core</Button>
                   </div>
              )}
          </div>
      </div>
    </div>
  );
}
