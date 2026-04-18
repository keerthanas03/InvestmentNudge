import { useState, useMemo } from "react";
import {
  useListTransactions,
  getListTransactionsQueryKey,
  useDeleteTransaction,
  useCreateTransaction,
  useGetCategoryBreakdown,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, Search, Filter, RefreshCcw, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_GLASS_COLORS = [
  'rgba(129, 230, 217, 0.7)',  // Teal Glass
  'rgba(251, 182, 206, 0.7)',  // Pink Glass
  'rgba(250, 240, 137, 0.7)',  // Yellow Glass
  'rgba(154, 230, 180, 0.7)',  // Green Glass
  'rgba(214, 188, 250, 0.7)',  // Lavender Glass
];

const createTransactionSchema = z.object({
  merchant: z.string().min(1, "Merchant is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  notes: z.string().optional(),
});

export default function Transactions() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: transactions, isLoading } = useListTransactions(undefined, {
    query: { queryKey: getListTransactionsQueryKey() },
  });

  const { data: categoryBreakdown, isLoading: isLoadingCategory } = useGetCategoryBreakdown();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter(t => {
      const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase()) || 
                           t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || t.category.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [transactions, search, categoryFilter]);

  const barChartData = useMemo(() => {
    return {
      labels: categoryBreakdown?.map(c => c.category) || [],
      datasets: [{
        label: 'Spent',
        data: categoryBreakdown?.map(c => c.amount) || [],
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
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
      }]
    };
  }, [categoryBreakdown]);

  const pieChartData = useMemo(() => {
    return {
      labels: categoryBreakdown?.map(c => c.category) || [],
      datasets: [{
        data: categoryBreakdown?.map(c => c.amount) || [],
        backgroundColor: CHART_GLASS_COLORS,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        hoverOffset: 10,
      }]
    };
  }, [categoryBreakdown]);

  const deleteMutation = useDeleteTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        toast.success("Transaction deleted");
      },
    },
  });

  const createMutation = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        toast.success("Transaction added");
        setIsAddOpen(false);
        form.reset();
      },
    },
  });

  const form = useForm<z.infer<typeof createTransactionSchema>>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: { merchant: "", amount: 0, category: "", subcategory: "", notes: "" },
  });

  function onSubmit(values: z.infer<typeof createTransactionSchema>) {
    createMutation.mutate({ data: {
        ...values,
        type: "Need"
    } as any });
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight logo-shimmer">Transactions</h1>
          <p className="text-[#9CA3AF] font-medium mt-2">Personalized financial history.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-premium rounded-xl shadow-lg border-none">
                <Plus className="w-4 h-4 mr-2" /> Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="merchant" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Merchant</FormLabel>
                      <FormControl><Input placeholder="e.g. Swiggy" {...field} className="glass-card bg-white/50" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl><Input type="number" {...field} className="glass-card bg-white/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <div className="space-y-1">
                            <Input placeholder="Enter category (e.g., Food, Transport)" {...field} className="glass-card bg-white/50" />
                            <p className="text-[10px] text-[#6B7280] font-medium ml-1">Examples: Food, Transport, Shopping</p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <Button type="submit" className="w-full btn-premium py-6 rounded-xl border-none" disabled={createMutation.isPending}>
                    Confirm
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 120, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}>
          <Card className="glass-card p-6 h-[400px]">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#FBB6CE]" />
                Spending by Category
            </h3>
            <div className="h-[300px]">
              <Bar 
                data={barChartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: 2000,
                        easing: 'easeOutQuart',
                    },
                    plugins: { legend: { display: false } },
                    scales: { y: { display: false }, x: { grid: { display : false } } }
                }}
              />
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 120, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}>
          <Card className="glass-card p-6 h-[400px]">
             <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-[#D6BCFA]" />
                Allocation Ratio
             </h3>
             <div className="h-[300px] flex items-center justify-center">
                <Pie 
                    data={pieChartData}
                    options={{ 
                        responsive: true, 
                        animation: {
                            duration: 2000,
                            easing: 'easeOutQuart',
                        },
                        plugins: { legend: { position: 'bottom' } } 
                    }}
                />
             </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        <Card className="glass-card lg:col-span-1 h-fit p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#6B7280] mb-4">Filters</h3>
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Search Merchant/Cat</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                        <Input 
                            placeholder="Search..." 
                            className="pl-9 glass-card bg-white/40" 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Category Filter</label>
                    <Input 
                        placeholder="Enter category name..." 
                        className="glass-card bg-white/40" 
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    />
                </div>
            </div>
        </Card>

        <Card className="glass-card lg:col-span-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="premium-table">
              <thead className="bg-[#A78BFA]/5 text-xs font-black uppercase tracking-widest text-[#6B7280]">
                <tr>
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Merchant</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                {filteredTransactions.map((tx) => (
                  <motion.tr 
                    key={tx.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[#6B7280]">
                      {format(new Date(tx.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#4B5563]">
                      {tx.merchant}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-[#A78BFA]/10 text-[#A78BFA]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-[#FBB6CE]">
                      ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="ghost" size="icon" 
                        className="text-[#6B7280] hover:text-red-500"
                        onClick={() => deleteMutation.mutate({ id: tx.id })}
                      >
                        <Trash2 className="h-4 h-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
