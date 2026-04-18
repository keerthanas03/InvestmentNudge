import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle, ShieldAlert, TrendingUp, Wallet, ShoppingBag, IndianRupee, Calendar, Percent } from "lucide-react";
import { useAnalyzeEmi, EmiAnalysisResponse } from "@workspace/api-client-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

export default function Planner() {
  const analyzeEmiMutation = useAnalyzeEmi();

  const [salary, setSalary] = useState(80000);
  const [productType, setProductType] = useState("Car");
  const [cost, setCost] = useState(1200000);
  const [downPayment, setDownPayment] = useState(200000);
  const [tenure, setTenure] = useState(60);
  const [interestRate, setInterestRate] = useState(9.0);

  const [result, setResult] = useState<EmiAnalysisResponse | null>(null);

  const handleAnalyze = async () => {
    try {
      const data = await analyzeEmiMutation.mutateAsync({
        data: {
          salary,
          productType,
          cost,
          downPayment,
          tenure,
          interestRate
        }
      });
      setResult(data);
      if (data.risk === "SAFE") toast.success("Looks affordable!");
      else if (data.risk === "CAUTION") toast.warning("Proceed with caution.");
      else toast.error("Danger: Unaffordable loan!");
    } catch (e) {
      toast.error("Failed to analyze affordability");
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "SAFE": return "bg-green-500";
      case "CAUTION": return "bg-yellow-500";
      case "DANGER": return "bg-red-500";
      default: return "bg-primary";
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case "SAFE": return "text-green-500";
      case "CAUTION": return "text-yellow-500";
      case "DANGER": return "text-red-500";
      default: return "text-foreground";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "SAFE": return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "CAUTION": return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case "DANGER": return <ShieldAlert className="h-6 w-6 text-red-500" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  const chartData = result ? [
    { name: "Est. EMI", value: result.emi, fill: result.risk === "SAFE" ? "#9AE6B4" : result.risk === "CAUTION" ? "#FAF089" : "#FEB2B2" },
    { name: "Safe Limit", value: result.safeLimit, fill: "#90CDF4" },
  ] : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calculator className="h-8 w-8 text-primary" /> Big Purchase Planner
        </h1>
        <p className="text-muted-foreground mt-1">Smart EMI affordability analyzer to check if you can safely afford a loan.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT FORM */}
        <motion.div 
          className="lg:col-span-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass-card border-none shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>Enter the specifics of your planned purchase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF]">
                    <Wallet className="w-3.5 h-3.5 text-[#FBB6CE]" /> Monthly salary
                  </Label>
                  <span className="font-black text-lg text-[#FBB6CE]">₹{salary.toLocaleString()}</span>
                </div>
                <Slider 
                  min={10000} 
                  max={1000000} 
                  step={5000} 
                  value={[salary]} 
                  onValueChange={v => setSalary(v[0])} 
                  className="[&>span]:bg-[#FBB6CE] [&>span>span]:bg-[#FBB6CE] py-4"
                />
                <Input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} className="glass-card h-12 font-black text-lg" />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF] px-1">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D6BCFA]" /> Product Type
                </Label>
                <div className="space-y-1">
                  <Input value={productType} onChange={e => setProductType(e.target.value)} placeholder="e.g. Car, Property, Other" className="glass-card h-12 font-bold" />
                  <p className="text-[10px] text-muted-foreground ml-1">Examples: Car, Property, Electronics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF] px-1">
                    <IndianRupee className="w-3.5 h-3.5 text-[#81E6D9]" /> Total Cost
                  </Label>
                  <Input type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="glass-card h-12 font-bold" />
                </div>
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF] px-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D6BCFA]" /> Down Payment
                  </Label>
                  <Input type="number" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="glass-card h-12 font-bold" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF]">
                    <Calendar className="w-3.5 h-3.5 text-[#FAF089]" /> tenure (Months)
                  </Label>
                  <span className="font-black text-lg text-[#FAF089]">{tenure} mo</span>
                </div>
                <Slider 
                  min={12} 
                  max={360} 
                  step={12} 
                  value={[tenure]} 
                  onValueChange={v => setTenure(v[0])} 
                  className="[&>span]:bg-[#FAF089] [&>span>span]:bg-[#FAF089] py-4"
                />
                <Input type="number" value={tenure} onChange={e => setTenure(Number(e.target.value))} className="glass-card h-12 font-bold" />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-[#9CA3AF] px-1">
                  <Percent className="w-3.5 h-3.5 text-[#9AE6B4]" /> Interest Rate (%)
                </Label>
                <Input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="glass-card h-12 font-bold text-lg" />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={analyzeEmiMutation.isPending}
                className="w-full h-14 text-lg shadow-xl hover:shadow-2xl transition-all btn-premium border-none font-black"
              >
                {analyzeEmiMutation.isPending ? "Analyzing..." : "Analyze Affordability"}
              </Button>

            </CardContent>
          </Card>
        </motion.div>

        {/* RESULTS SECTION */}
        <motion.div 
          className="lg:col-span-7 flex flex-col gap-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          {result ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                layout
              >
                <Card className="glass-card shadow-xl overflow-hidden border-none relative">
                  <div className={`absolute top-0 left-0 w-2 h-full ${getRiskColor(result.risk)}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">Analysis Results</CardTitle>
                        <CardDescription>Based on the 20% income rule</CardDescription>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                        {getRiskIcon(result.risk)}
                        <span className={`font-bold ${getRiskText(result.risk)}`}>{result.risk}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Estimated EMI</p>
                        <motion.h3 
                          key={result.emi}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`text-3xl font-bold tracking-tight ${getRiskText(result.risk)}`}
                        >
                          ₹{result.emi.toLocaleString()}
                        </motion.h3>
                        <p className="text-xs text-muted-foreground mt-2">{result.percentage}% of your salary</p>
                      </div>
                      <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Safe Limit (20%)</p>
                        <h3 className="text-3xl font-bold tracking-tight text-blue-500">
                          ₹{result.safeLimit.toLocaleString()}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2">Maximum recommended EMI</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Risk Indicator</span>
                        <span>{result.percentage}%</span>
                      </div>
                      <div className="h-4 w-full bg-muted rounded-full overflow-hidden relative">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(result.percentage, 100)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${getRiskColor(result.risk)}`}
                        />
                        {/* 20% marker */}
                        <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-black/20" />
                        {/* 30% marker */}
                        <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-black/20" />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span className="ml-[6%]">Safe (20%)</span>
                        <span className="ml-[4%]">Danger (30%)</span>
                        <span>100%</span>
                      </div>
                    </div>

                    <div className="h-64 mt-4 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                          <XAxis dataKey="name" tick={{fill: "hsl(var(--foreground))"}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fill: "hsl(var(--muted-foreground))"}} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                          />
                          <ReferenceLine y={result.safeLimit * 1.5} label={{ position: 'top', value: '30% Danger Limit', fill: '#ef4444', fontSize: 12 }} stroke="#ef4444" strokeDasharray="3 3" />
                          <Bar 
                            dataKey="value" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={60}
                            animationBegin={0}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {
                              chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))
                            }
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* NUDGES SECTION */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  {result.risk === "DANGER" && (
                     <Card className="bg-red-50/50 border-red-200 shadow-md">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                           <ShieldAlert className="h-5 w-5" /> Financial Warning
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-4">
                         <p className="text-sm text-red-800">This purchase heavily impacts your monthly cash flow. We highly recommend rethinking this decision.</p>
                         <ul className="space-y-2 text-sm text-red-700 list-disc pl-5">
                           <li><strong>Increase Down Payment:</strong> Save up to ₹{(cost * 0.4).toLocaleString()} to lower EMI.</li>
                           <li><strong>Reduce Loan Tenure:</strong> Wait, actually increasing tenure lowers EMI, but increases total interest. Consider opting for a cheaper {productType}.</li>
                           <li><strong>Delay Purchase:</strong> Wait 6 months and invest the intended EMI (₹{result.emi.toLocaleString()}) to build capital.</li>
                         </ul>
                         <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-100">Explore Investment Alternatives</Button>
                       </CardContent>
                     </Card>
                  )}
                  
                  {result.risk === "CAUTION" && (
                    <Card className="bg-yellow-50/50 border-yellow-200 shadow-md">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-yellow-700 flex items-center gap-2 text-lg">
                           <AlertTriangle className="h-5 w-5" /> Proceed cautiously
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <p className="text-sm text-yellow-800 mb-3">You are stretching your budget slightly. Make sure you don't have other major EMIs.</p>
                         <ul className="space-y-1 text-sm text-yellow-700 list-disc pl-5">
                           <li>Reduce the {productType} cost by 10-15%.</li>
                           <li>Track your other expenses tightly for the first 3 months.</li>
                         </ul>
                       </CardContent>
                     </Card>
                  )}

                  {result.risk === "SAFE" && (
                    <Card className="bg-green-50/50 border-green-200 shadow-md">
                       <CardHeader className="pb-3">
                         <CardTitle className="text-green-700 flex items-center gap-2 text-lg">
                           <CheckCircle className="h-5 w-5" /> You're good to go!
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <p className="text-sm text-green-800 mb-3">This purchase is well within your means. Great job maintaining a healthy affordability ratio.</p>
                         <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-100">
                           <TrendingUp className="h-5 w-5 text-green-600" />
                           <span className="text-xs text-green-900 font-medium">You still have room to invest ₹{(result.safeLimit - result.emi).toLocaleString()} per month!</span>
                         </div>
                       </CardContent>
                     </Card>
                  )}

                </motion.div>

              </motion.div>
            </AnimatePresence>
          ) : (
            <Card className="glass-card shadow-sm h-full flex flex-col items-center justify-center p-12 text-center border-dashed border-4 border-[#FBB6CE]/20 group">
               <div className="p-8 rounded-[3rem] bg-gradient-to-br from-[#FBB6CE]/5 to-[#D6BCFA]/5 mb-8 relative">
                   <Calculator className="h-24 w-24 text-[#FBB6CE] opacity-80 group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#D6BCFA]/20 rounded-full blur-xl" />
               </div>
               <h3 className="text-3xl font-black text-[#4B5563] mb-4 tracking-tighter">Ready to crunch the numbers?</h3>
               <p className="text-sm text-[#9CA3AF] max-w-sm font-medium leading-relaxed">Enter your purchase details on the left and click 'Analyze Affordability' to see if this fits in your budget.</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
