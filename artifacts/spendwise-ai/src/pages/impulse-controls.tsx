import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Clock, Lock, AlertTriangle, CheckCircle, Timer, Ban } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListCategories, getListCategoriesQueryKey, useUpdateCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SPENDING_LOCKS = [
  { label: "Late Night (10pm - 7am)", description: "Block impulsive late-night purchases", icon: Clock },
  { label: "Weekends", description: "Pause non-essential spending on weekends", icon: Ban },
  { label: "After 3 Transactions", description: "Lock after 3 transactions in one day", icon: Lock },
];

export default function ImpulseControls() {
  const queryClient = useQueryClient();
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [cooldownDuration, setCooldownDuration] = useState(30);
  const [locks, setLocks] = useState<Record<string, boolean>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });
  const updateCategory = useUpdateCategory();

  const startCooldown = () => {
    setCooldownActive(true);
    setCooldownSeconds(cooldownDuration);
    intervalRef.current = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          setCooldownActive(false);
          clearInterval(intervalRef.current!);
          toast.success("Cooldown complete! You can now proceed with the purchase.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCooldown = () => {
    clearInterval(intervalRef.current!);
    setCooldownActive(false);
    setCooldownSeconds(0);
    toast.info("Purchase cancelled. Good decision!");
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleLock = (label: string) => {
    setLocks(prev => ({ ...prev, [label]: !prev[label] }));
    toast.success(`${locks[label] ? "Disabled" : "Enabled"} spending lock: ${label}`);
  };

  const toggleCategoryBlock = async (categoryId: number, currentValue: boolean) => {
    await updateCategory.mutateAsync({ id: categoryId, data: { blockSpending: !currentValue } });
    queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
    toast.success(`Category spending ${!currentValue ? "blocked" : "unblocked"}`);
  };

  const progress = cooldownDuration > 0 ? ((cooldownDuration - cooldownSeconds) / cooldownDuration) * 100 : 0;

  return (
    <div className="space-y-10 pb-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-tight text-[#4B5563] logo-shimmer">Impulse Controls</h1>
        <p className="text-[#9CA3AF] font-medium mt-2 text-lg">Smart cognitive tools to pause before you spend impulsively.</p>
      </motion.div>

      {/* Cooldown Timer */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-10 relative overflow-hidden group shadow-2xl border-none"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FBB6CE]/10 rounded-full blur-[100px] group-hover:bg-[#FBB6CE]/20 transition-all duration-700" />
        
        <div className="flex items-center gap-6 mb-10 relative z-10">
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#FBB6CE]/20 to-[#FBB6CE]/5 shadow-inner">
            <Timer className="h-8 w-8 text-[#FBB6CE]" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-[#4B5563]">Purchase Cooldown Timer</h3>
            <p className="text-sm text-[#9CA3AF] font-bold">Psychological buffer to prevent instant regret.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="flex-1 space-y-6 w-full">
            <div className="bg-white/40 p-6 rounded-[2.5rem] border border-white/50">
              <span className="text-xs font-black uppercase tracking-widest text-[#9CA3AF] mb-4 block">Select duration</span>
              <div className="flex flex-wrap gap-3">
                {[15, 30, 60, 120].map(sec => (
                  <button
                    key={sec}
                    onClick={() => setCooldownDuration(sec)}
                    className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${
                      cooldownDuration === sec
                        ? "bg-[#FBB6CE] text-white shadow-[0_8px_20px_rgba(251,182,206,0.3)] scale-110"
                        : "bg-white/80 text-[#9CA3AF] hover:bg-white"
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!cooldownActive ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Button 
                    onClick={startCooldown} 
                    className="w-full h-16 text-lg rounded-[2rem] shadow-xl hover:shadow-2xl transition-all btn-premium border-none font-black" 
                    data-testid="button-start-cooldown"
                  >
                    <Timer className="h-5 w-5 mr-3" />
                    Start {cooldownDuration}s Cooldown
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                   <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={cancelCooldown}
                      className="flex-1 h-14 rounded-[1.5rem] border-2 border-white/50 bg-white/20 font-black text-[#9CA3AF] hover:bg-white/40"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Abort
                    </Button>
                    <Button
                      onClick={() => {
                        clearInterval(intervalRef.current!);
                        setCooldownActive(false);
                        toast.info("Proceeding with purchase.");
                      }}
                      className="flex-[2] h-14 rounded-[1.5rem] bg-[#9AE6B4] text-white font-black shadow-lg disabled:opacity-50"
                      disabled={cooldownSeconds > 0}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Proceed"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Circular Progress */}
              <svg className="w-full h-full rotate-[-90deg]">
                <circle
                  cx="96" cy="96" r="80"
                  fill="transparent"
                  stroke="rgba(0,0,0,0.05)"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="96" cy="96" r="80"
                  fill="transparent"
                  stroke="#FBB6CE"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "502.4 502.4", strokeDashoffset: 502.4 }}
                  animate={{ strokeDashoffset: 502.4 - (502.4 * progress) / 100 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-black text-[#4B5563] tracking-tighter">{cooldownSeconds || cooldownDuration}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#9CA3AF]">seconds</span>
              </div>
              {cooldownActive && (
                <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-[#FBB6CE]/20 blur-xl"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Spending Lock Windows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-10 relative overflow-hidden group shadow-2xl border-none"
      >
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#D6BCFA]/10 rounded-full blur-[100px] group-hover:bg-[#D6BCFA]/20 transition-all duration-700" />
        
        <div className="flex items-center gap-6 mb-10 relative z-10">
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#D6BCFA]/20 to-[#D6BCFA]/5 shadow-inner">
            <Lock className="h-8 w-8 text-[#D6BCFA]" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-[#4B5563]">Spending Lock Windows</h3>
            <p className="text-sm text-[#9CA3AF] font-bold">Restrict high-risk behavioral patterns.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {SPENDING_LOCKS.map((lock, i) => (
            <motion.div
              key={lock.label}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-[2.5rem] transition-all border-none ${
                locks[lock.label] ? 'bg-[#D6BCFA]/10 shadow-lg' : 'bg-white/40'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className={`p-4 rounded-2xl ${locks[lock.label] ? 'bg-[#D6BCFA] text-white' : 'bg-white/60 text-[#9CA3AF]'}`}>
                  <lock.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black text-sm text-[#4B5563]">{lock.label}</p>
                  <p className="text-xs text-[#9CA3AF] font-bold mt-1 leading-tight">{lock.description}</p>
                </div>
                <Switch
                  checked={locks[lock.label] ?? false}
                  onCheckedChange={() => toggleLock(lock.label)}
                  className="mt-2"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Category Blocking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-10 relative overflow-hidden group shadow-2xl border-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FC8181]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex items-center gap-6 mb-10 relative z-10">
          <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#FC8181]/20 to-[#FC8181]/5 shadow-inner">
            <Shield className="h-8 w-8 text-[#FC8181]" />
          </div>
          <div>
            <h3 className="font-black text-2xl text-[#4B5563]">Category Blocking</h3>
            <p className="text-sm text-[#9CA3AF] font-bold">Hard-restrict specific impulse merchants.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48 relative z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8181]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {categories?.map((category, i) => (
              <motion.div
                key={category.id}
                whileHover={{ y: -5 }}
                className={`p-6 rounded-[2.5rem] border-none flex flex-col gap-4 shadow-sm transition-all ${
                  category.blockSpending
                    ? "bg-[#FC8181]/15 ring-2 ring-[#FC8181]/30"
                    : "bg-white/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      <Ban className="w-5 h-5 text-white/80" />
                    </div>
                    <div>
                      <span className="text-sm font-black text-[#4B5563] block">{category.name}</span>
                      {category.blockSpending && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FC8181]">System Locked</span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={category.blockSpending}
                    onCheckedChange={() => toggleCategoryBlock(category.id, category.blockSpending)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
