import { useState } from "react";
import { motion } from "framer-motion";
import {
  useListInvestments, getListInvestmentsQueryKey,
  useGetInvestmentSettings, getGetInvestmentSettingsQueryKey,
  useUpdateInvestmentSettings
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, DollarSign, Zap, Settings, BarChart2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

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

  const chartData = investments
    ?.slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce<{ date: string; cumulative: number }[]>((acc, inv) => {
      const date = new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const last = acc[acc.length - 1];
      acc.push({ date, cumulative: (last?.cumulative ?? 0) + inv.amount });
      return acc;
    }, []) ?? [];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Investments</h1>
        <p className="text-muted-foreground mt-1">Track your auto and manual investment activity.</p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Invested", value: `₹${totalInvested.toFixed(0)}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: "Auto Investments", value: autoCount, icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Manual Investments", value: manualCount, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="p-5 rounded-xl border border-border bg-card shadow-sm"
          >
            <div className={`p-2 rounded-lg ${card.bg} w-fit mb-3`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Investment Growth Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-6 rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Cumulative Investment Growth</h3>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toFixed(0)}`, "Cumulative"]} />
                <Area type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Auto-Invest Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Auto-Invest Settings</h3>
              <p className="text-sm text-muted-foreground">Automatically invest when nudges are triggered.</p>
            </div>
          </div>
          <Switch
            checked={settings?.autoInvestEnabled ?? false}
            onCheckedChange={handleToggleAuto}
            data-testid="switch-auto-invest"
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">% of Overspend to Invest</label>
              <span className="text-sm text-primary font-semibold">
                {localPercent ?? settings?.overspendPercent ?? 20}%
              </span>
            </div>
            <Slider
              min={5}
              max={50}
              step={5}
              value={[localPercent ?? settings?.overspendPercent ?? 20]}
              onValueChange={([v]) => setLocalPercent(v)}
              className="w-full"
              data-testid="slider-overspend-percent"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Weekly Cap</label>
              <span className="text-sm text-primary font-semibold">
                ₹{(localCap ?? settings?.weeklyCap ?? 500).toFixed(0)}
              </span>
            </div>
            <Slider
              min={100}
              max={2000}
              step={100}
              value={[localCap ?? settings?.weeklyCap ?? 500]}
              onValueChange={([v]) => setLocalCap(v)}
              className="w-full"
              data-testid="slider-weekly-cap"
            />
          </div>

          <Button onClick={handleSaveSettings} className="w-full" data-testid="button-save-settings">
            Save Settings
          </Button>
        </div>
      </motion.div>

      {/* Investment History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <h3 className="font-semibold text-lg mb-4">Investment History</h3>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : investments && investments.length > 0 ? (
          <div className="space-y-2">
            {[...investments].reverse().map((investment, i) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.03 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${investment.source === "auto" ? "bg-blue-50" : "bg-green-50"}`}>
                    {investment.source === "auto" ? (
                      <Zap className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{investment.category.replace(/-/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(investment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+₹{investment.amount.toFixed(0)}</p>
                  <Badge variant="outline" className="text-xs">
                    {investment.source === "auto" ? "Auto" : "Manual"}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No investments yet. Accept a nudge to start!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
