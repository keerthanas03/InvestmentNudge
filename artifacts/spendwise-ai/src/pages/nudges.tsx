import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useListNudgeRules, getListNudgeRulesQueryKey,
  useCreateNudgeRule, useUpdateNudgeRule, useDeleteNudgeRule,
  useListPendingNudges, getListPendingNudgesQueryKey,
  useDismissNudge, useAcceptNudge
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, Trash2, CheckCircle, X, Bell, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

type NudgeRuleForm = {
  name: string;
  thresholdAmount: number;
  investmentType: string;
  investmentValue: number;
  nudgeIntensity: string;
};

export default function Nudges() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: nudgeRules, isLoading: rulesLoading } = useListNudgeRules({
    query: { queryKey: getListNudgeRulesQueryKey() }
  });
  const { data: pendingNudges, isLoading: nudgesLoading } = useListPendingNudges({
    query: { queryKey: getListPendingNudgesQueryKey() }
  });

  const createRule = useCreateNudgeRule();
  const updateRule = useUpdateNudgeRule();
  const deleteRule = useDeleteNudgeRule();
  const dismissNudge = useDismissNudge();
  const acceptNudge = useAcceptNudge();

  const form = useForm<NudgeRuleForm>({
    defaultValues: {
      name: "",
      thresholdAmount: 1000,
      investmentType: "percentage",
      investmentValue: 10,
      nudgeIntensity: "gentle",
    }
  });

  const handleCreateRule = async (data: NudgeRuleForm) => {
    await createRule.mutateAsync({
      data: {
        name: data.name,
        thresholdAmount: Number(data.thresholdAmount),
        investmentType: data.investmentType,
        investmentValue: Number(data.investmentValue),
        nudgeIntensity: data.nudgeIntensity,
      }
    });
    queryClient.invalidateQueries({ queryKey: getListNudgeRulesQueryKey() });
    toast.success("Nudge rule created!");
    setIsDialogOpen(false);
    form.reset();
  };

  const handleToggleRule = async (id: number, currentActive: boolean) => {
    await updateRule.mutateAsync({ id, data: { isActive: !currentActive } });
    queryClient.invalidateQueries({ queryKey: getListNudgeRulesQueryKey() });
    toast.success(`Rule ${!currentActive ? "activated" : "deactivated"}`);
  };

  const handleDeleteRule = async (id: number) => {
    await deleteRule.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListNudgeRulesQueryKey() });
    toast.success("Rule deleted");
  };

  const handleDismiss = async (id: number) => {
    await dismissNudge.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListPendingNudgesQueryKey() });
    toast.success("+50 points! Impulse avoided.");
  };

  const handleAccept = async (id: number) => {
    await acceptNudge.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListPendingNudgesQueryKey() });
    toast.success("+75 points! Investment made.");
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nudge Engine</h1>
          <p className="text-muted-foreground mt-1">Smart rules to redirect impulse spending into investments.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-rule">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Nudge Rule</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateRule)} className="space-y-4">
              <div>
                <Label>Rule Name</Label>
                <Input {...form.register("name")} placeholder="e.g. High Spender Alert" data-testid="input-rule-name" />
              </div>
              <div>
                <Label>Threshold Amount (₹)</Label>
                <Input type="number" {...form.register("thresholdAmount")} placeholder="1000" data-testid="input-threshold" />
              </div>
              <div>
                <Label>Investment Type</Label>
                <Select
                  value={form.watch("investmentType")}
                  onValueChange={v => form.setValue("investmentType", v)}
                >
                  <SelectTrigger data-testid="select-investment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage of spend</SelectItem>
                    <SelectItem value="fixed">Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>
                  {form.watch("investmentType") === "percentage" ? "Percentage (%)" : "Fixed Amount (₹)"}
                </Label>
                <Input type="number" {...form.register("investmentValue")} placeholder="10" data-testid="input-investment-value" />
              </div>
              <div>
                <Label>Nudge Intensity</Label>
                <Select
                  value={form.watch("nudgeIntensity")}
                  onValueChange={v => form.setValue("nudgeIntensity", v)}
                >
                  <SelectTrigger data-testid="select-nudge-intensity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">Gentle</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createRule.isPending} data-testid="button-create-rule">
                {createRule.isPending ? "Creating..." : "Create Rule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Pending Nudges */}
      {(pendingNudges?.length ?? 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border-2 border-primary/30 bg-primary/5 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Pending Nudges</h3>
              <p className="text-sm text-muted-foreground">Take action to earn points!</p>
            </div>
            <Badge className="ml-auto">{pendingNudges?.length}</Badge>
          </div>
          {nudgesLoading ? (
            <div className="flex items-center justify-center h-16">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {pendingNudges?.map((nudge, i) => (
                  <motion.div
                    key={nudge.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-orange-50 mt-0.5">
                        <Zap className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{nudge.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Suggested: ₹{nudge.suggestedInvestment.toFixed(0)} investment
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDismiss(nudge.id)}
                        disabled={dismissNudge.isPending}
                        data-testid={`button-dismiss-nudge-${nudge.id}`}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAccept(nudge.id)}
                        disabled={acceptNudge.isPending}
                        data-testid={`button-accept-nudge-${nudge.id}`}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Invest
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* Nudge Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Nudge Rules</h3>
        </div>
        {rulesLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : nudgeRules && nudgeRules.length > 0 ? (
          <div className="space-y-3">
            {nudgeRules.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  rule.isActive ? "border-primary/20 bg-primary/5" : "border-border bg-muted/20 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${rule.isActive ? "bg-primary/10" : "bg-muted"}`}>
                    <Zap className={`h-4 w-4 ${rule.isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{rule.name}</p>
                      <Badge variant={rule.nudgeIntensity === "aggressive" ? "destructive" : "secondary"} className="text-xs">
                        {rule.nudgeIntensity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      If spend &gt; ₹{rule.thresholdAmount} → Invest{" "}
                      {rule.investmentType === "percentage"
                        ? `${rule.investmentValue}%`
                        : `₹${rule.investmentValue}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                    className="p-1 hover:bg-muted rounded-md transition-colors"
                    data-testid={`button-toggle-rule-${rule.id}`}
                  >
                    {rule.isActive
                      ? <ToggleRight className="h-5 w-5 text-primary" />
                      : <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    }
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1 hover:bg-destructive/10 rounded-md transition-colors"
                    data-testid={`button-delete-rule-${rule.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Zap className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No nudge rules yet. Add one to start nudging!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
