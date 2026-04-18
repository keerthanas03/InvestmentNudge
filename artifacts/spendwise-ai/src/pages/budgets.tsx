import { useState, useMemo } from "react";
import { 
  useListBudgets, 
  getListBudgetsQueryKey, 
  useCreateBudget, 
  useDeleteBudget,
  useGetCategoryBreakdown 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Plus, Trash2, PieChart as PieChartIcon, AlertCircle, TrendingUp, Target, Zap, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';

const createBudgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  limitAmount: z.coerce.number().positive("Amount must be positive"),
  period: z.string().default("monthly"),
});

export default function Budgets() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: budgets, isLoading: isLoadingBudgets } = useListBudgets({
    query: { queryKey: getListBudgetsQueryKey() }
  });

  const { data: categoryBreakdown, isLoading: isLoadingBreakdown } = useGetCategoryBreakdown();

  const deleteMutation = useDeleteBudget({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
        toast.success("Budget removed");
      },
    },
  });

  const createMutation = useCreateBudget({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
        toast.success("Budget created");
        setIsAddOpen(false);
        form.reset();
      },
    },
  });

  const form = useForm<z.infer<typeof createBudgetSchema>>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: { category: "", limitAmount: 0, period: "monthly" },
  });

  function onSubmit(values: z.infer<typeof createBudgetSchema>) {
    createMutation.mutate({ data: {
        ...values,
        budgetType: "soft"
    } as any });
  }

  const getSuggestion = (category: string) => {
    if (!category) return null;
    const historical = categoryBreakdown?.find(c => c.category.toLowerCase() === category.toLowerCase())?.amount || 0;
    return historical > 0 ? Math.floor(historical * 0.9) : 2000;
  };

  const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 15000];

  const chartData = useMemo(() => {
    if (!budgets || !categoryBreakdown) return [];
    return budgets.map(b => {
      const spent = categoryBreakdown.find(c => c.category.toLowerCase() === b.category.toLowerCase())?.amount || 0;
      return {
        name: b.category,
        budget: b.limitAmount,
        spent: spent,
        ratio: b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0
      };
    });
  }, [budgets, categoryBreakdown]);

  const totalBudget = useMemo(() => budgets?.reduce((acc, b) => acc + b.limitAmount, 0) || 0, [budgets]);
  const totalSpent = useMemo(() => {
    if (!budgets || !categoryBreakdown) return 0;
    return budgets.reduce((acc, b) => {
        const spent = categoryBreakdown.find(c => c.category.toLowerCase() === b.category.toLowerCase())?.amount || 0;
        return acc + spent;
    }, 0);
  }, [budgets, categoryBreakdown]);

  const totalPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  if (isLoadingBudgets || isLoadingBreakdown) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-56 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  const selectedCategory = form.watch("category");
  const suggestion = getSuggestion(selectedCategory);

  return (
    <div className="space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight logo-shimmer">Smart Budgets</h1>
          <p className="text-muted-foreground mt-2">Intelligent spending control with automated nudges.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="glass-nav-active border-none shadow-xl scale-105">
              <Plus className="w-5 h-5 mr-2" /> Set New Limit
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Configure Guardrail</DialogTitle>
              <CardDescription className="font-medium">Set a monthly limit to prevent wealth erosion.</CardDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-black text-xs uppercase tracking-widest opacity-70">Category</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <Input placeholder="Enter category name" {...field} className="glass-card bg-white/50 h-12 text-lg font-bold" />
                        <p className="text-[10px] text-[#6B7280] font-medium ml-1">Examples: Food, Transport, Shopping</p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="space-y-4">
                  <FormField control={form.control} name="limitAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-black text-xs uppercase tracking-widest opacity-70">Monthly Limit (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} className="glass-card bg-white/50 h-14 text-2xl font-black" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {selectedCategory && (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all"
                        onClick={() => form.setValue("limitAmount", suggestion || 0)}
                    >
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase text-primary/80">AI Suggested</span>
                        </div>
                        <span className="text-xs font-black">₹{suggestion?.toLocaleString()} <span className="text-[10px] font-medium opacity-50 px-1">(Apply)</span></span>
                    </motion.div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {QUICK_AMOUNTS.map(amt => (
                        <button
                            key={amt}
                            type="button"
                            onClick={() => form.setValue("limitAmount", amt)}
                            className="px-3 py-1.5 rounded-lg border border-border/10 bg-white/40 text-[10px] font-black hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                        >
                            ₹{(amt/1000).toFixed(0)}K
                        </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 text-lg glass-nav-active border-none shadow-lg mt-4" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Configuring Guardrail..." : "Activate Limit"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card col-span-1 lg:col-span-2 overflow-hidden border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Utilization Analytics
              </CardTitle>
              <CardDescription>Spent vs. Budgeted across core categories.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barGap={8}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                    dataKey="name" 
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
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                        fontWeight: 'bold'
                    }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700 }} />
                <Bar dataKey="spent" name="Actually Spent" fill="#FBB6CE" radius={[4, 4, 0, 0]} barSize={24} animationBegin={0} animationDuration={1500} animationEasing="ease-out" />
                <Bar dataKey="budget" name="Planned Budget" fill="#D6BCFA" radius={[4, 4, 0, 0]} barSize={24} animationBegin={0} animationDuration={1500} animationEasing="ease-out" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden border-none shadow-xl flex flex-col">
           <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-primary" /> Global Health
              </CardTitle>
              <CardDescription>Total monthly adherence.</CardDescription>
           </CardHeader>
           <CardContent className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-40 h-40">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" stroke="currentColor" 
                        strokeWidth="8" className="text-muted/10" 
                      />
                      <motion.circle 
                        cx="50" cy="50" r="45" 
                        fill="none" stroke="currentColor" 
                        strokeWidth="8" 
                        className="text-primary"
                        strokeDasharray={283}
                        initial={{ strokeDashoffset: 283 }}
                        animate={{ strokeDashoffset: 283 - (283 * Math.min(totalPercent, 100)) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black tracking-tighter">{totalPercent.toFixed(0)}%</span>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Used</span>
                  </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-white/50 border border-border/10">
                      <p className="text-[10px] font-black uppercase opacity-50 mb-1">Total Limit</p>
                      <p className="text-lg font-black tracking-tight">₹{(totalBudget/1000).toFixed(1)}k</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/50 border border-border/10">
                      <p className="text-[10px] font-black uppercase opacity-50 mb-1">Total Spent</p>
                      <p className="text-lg font-black tracking-tight">₹{(totalSpent/1000).toFixed(1)}k</p>
                  </div>
              </div>
           </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {budgets?.map((budget, i) => {
            const spent = categoryBreakdown?.find(c => c.category.toLowerCase() === budget.category.toLowerCase())?.amount || 0;
            const percent = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
            const isWarning = percent >= 80 && percent < 100;
            const isExceeded = percent >= 100;
            
            let statusColor = "bg-emerald-500";
            let borderColor = "border-border/10";
            let statusText = "Healthy";
            let nudge = "Nice work! You're disciplined this month.";

            if (isExceeded) {
                statusColor = "bg-rose-500";
                borderColor = "border-rose-200 bg-rose-50/5";
                statusText = "Exceeded";
                nudge = `Over by ₹${(spent - budget.limitAmount).toFixed(0)}. Stop spending and invest ₹500 immediately to offset!`;
            } else if (isWarning) {
                statusColor = "bg-amber-500";
                borderColor = "border-amber-200 bg-amber-50/5";
                statusText = "Warning";
                nudge = "You've used 80%+. Time to cut back on luxury items.";
            }

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`glass-card overflow-hidden group border-2 ${borderColor} transition-all duration-500`}>
                  <CardHeader className="pb-3 px-6 pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl ${statusColor.replace('bg-', 'bg-')}/10 ${statusColor.replace('bg-', 'text-')}`}>
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black">{budget.category}</CardTitle>
                            <CardDescription className="font-medium">Limit: ₹{budget.limitAmount?.toLocaleString() ?? "0"}</CardDescription>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" size="icon" 
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => deleteMutation.mutate({ id: budget.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">Amount Spent</p>
                        <p className="text-3xl font-black tracking-tighter">₹{spent.toLocaleString()}</p>
                      </div>
                      <Badge variant="outline" className={`px-2 py-0.5 rounded-lg border-2 font-black text-[10px] ${statusColor.replace('bg-', 'text-')} ${statusColor.replace('bg-', 'border-')}/20`}>
                        {statusText}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                        <Progress 
                            value={Math.min(percent, 100)} 
                            className={`h-3 rounded-full bg-muted/20 ${statusColor.replace('bg-', '[&>div]:bg-')}`} 
                        />
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                            <span>{percent.toFixed(0)}% Utilized</span>
                            <span>{isExceeded ? 'Critical' : isWarning ? 'Caution' : 'Safe'}</span>
                        </div>
                    </div>

                    <div className={`p-4 rounded-2xl border flex gap-3 ${isExceeded ? 'bg-rose-50/50 border-rose-100' : isWarning ? 'bg-amber-50/50 border-amber-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                        <div className={`p-1.5 rounded-xl h-fit ${isExceeded ? 'bg-rose-100 text-rose-600' : isWarning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            <Zap className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[11px] font-bold leading-tight flex-1">
                            <span className="block text-[9px] uppercase tracking-widest opacity-60 mb-1 underline">Investment Nudge</span>
                            {nudge}
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {budgets?.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-24 text-center glass-card border-dashed">
             <Target className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10 animate-pulse" />
             <h3 className="text-2xl font-black text-muted-foreground">Zero Limits Active</h3>
             <p className="text-sm text-muted-foreground/60 mt-2 max-w-sm mx-auto">Establish guardrails to unlock the automated wealth-building engine.</p>
             <Button className="mt-8 glass-nav-active border-none px-10 h-12 shadow-xl" onClick={() => setIsAddOpen(true)}>
                <Plus className="w-5 h-5 mr-2" /> Activate Smart Guard
             </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}