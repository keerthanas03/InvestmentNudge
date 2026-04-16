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
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Impulse Controls</h1>
        <p className="text-muted-foreground mt-1">Smart tools to pause before you spend impulsively.</p>
      </motion.div>

      {/* Cooldown Timer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-orange-50">
            <Timer className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Purchase Cooldown Timer</h3>
            <p className="text-sm text-muted-foreground">Force a pause before completing impulse purchases.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-muted-foreground">Cooldown duration:</span>
          {[15, 30, 60, 120].map(sec => (
            <button
              key={sec}
              onClick={() => setCooldownDuration(sec)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                cooldownDuration === sec
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!cooldownActive ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button onClick={startCooldown} className="w-full" data-testid="button-start-cooldown">
                <Timer className="h-4 w-4 mr-2" />
                Start {cooldownDuration}s Cooldown Before Purchase
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative h-20 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-8 border-muted relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-orange-500 origin-bottom"
                      style={{
                        scaleY: progress / 100,
                        bottom: 0,
                        position: "absolute",
                        width: "100%",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold z-10 text-foreground">{cooldownSeconds}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-800">Think it through...</p>
                <p className="text-xs text-orange-600 mt-1">Do you really need this right now?</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelCooldown}
                  className="flex-1"
                  data-testid="button-cancel-purchase"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Cancel Purchase
                </Button>
                <Button
                  onClick={() => {
                    clearInterval(intervalRef.current!);
                    setCooldownActive(false);
                    toast.info("Proceeding with purchase.");
                  }}
                  variant="secondary"
                  className="flex-1"
                  disabled={cooldownSeconds > 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {cooldownSeconds > 0 ? `Wait ${cooldownSeconds}s` : "Proceed"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Spending Lock Windows */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-blue-50">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Spending Lock Windows</h3>
            <p className="text-sm text-muted-foreground">Automatically restrict spending during high-risk times.</p>
          </div>
        </div>
        <div className="space-y-3">
          {SPENDING_LOCKS.map((lock, i) => (
            <motion.div
              key={lock.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-background">
                  <lock.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{lock.label}</p>
                  <p className="text-xs text-muted-foreground">{lock.description}</p>
                </div>
              </div>
              <Switch
                checked={locks[lock.label] ?? false}
                onCheckedChange={() => toggleLock(lock.label)}
                data-testid={`switch-lock-${i}`}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Category Blocking */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-red-50">
            <Shield className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Category Blocking</h3>
            <p className="text-sm text-muted-foreground">Block spending in specific categories entirely.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories?.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  category.blockSpending
                    ? "border-red-200 bg-red-50"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                  {category.blockSpending && (
                    <Badge variant="destructive" className="text-xs">Blocked</Badge>
                  )}
                </div>
                <Switch
                  checked={category.blockSpending}
                  onCheckedChange={() => toggleCategoryBlock(category.id, category.blockSpending)}
                  data-testid={`switch-block-${category.id}`}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
