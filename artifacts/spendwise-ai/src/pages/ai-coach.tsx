import React from "react";
import { motion } from "framer-motion";
import { 
  BrainCircuit, 
  TrendingUp, 
  Zap, 
  Moon, 
  Calendar, 
  Award,
  AlertCircle,
  Lightbulb,
  ArrowRight
} from "lucide-react";
import { useGetAnalysis } from "@workspace/api-client-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#9AE6B4", "#FAF089", "#FEB2B2", "#90CDF4", "#D6BCFA"];

export default function AICoach() {
  const { data: analysis, isLoading } = useGetAnalysis();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const userProfile = analysis?.userProfile;
  const activeNudge = analysis?.activeNudge;
  const behavioralStats = analysis?.behavioralStats;

  const scoreData = [
    { name: "Impulse", value: userProfile?.impulseScore || 0 },
    { name: "Remaining", value: 100 - (userProfile?.impulseScore || 0) },
  ];

  const getScoreColor = (score: number) => {
    if (score < 30) return "#9AE6B4";
    if (score < 60) return "#FAF089";
    return "#FEB2B2";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Financial Coach</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Personalized behavioral insights and autonomous investment nudges.
        </p>
      </header>

      {/* Hero Classification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={450}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      <Cell fill={getScoreColor(userProfile?.impulseScore || 0)} />
                      <Cell fill="rgba(0,0,0,0.05)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{userProfile?.impulseScore}</span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Impulse Score</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-sm px-3 py-1">
                    Behavior Analysis
                  </Badge>
                  <h2 className="text-4xl font-extrabold tracking-tight">
                    {userProfile?.classification || "Analyzing Behavior..."}
                  </h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-xl">
                  Your primary spending is driven by <span className="text-primary font-semibold">{userProfile?.dominantCategory}</span>. 
                  {userProfile?.impulseScore && userProfile.impulseScore > 50 
                    ? " Frequent small transactions are hurting your potential savings." 
                    : " You show strong discipline in your financial decisions."}
                </p>
                <div className="flex gap-4">
                  <Button className="rounded-full px-6">View Strategy</Button>
                  <Button variant="outline" className="rounded-full px-6">Download Report</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Behavioral Stats */}
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" /> Pattern Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <Moon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Late Night Activity</p>
                  <p className="text-xs text-muted-foreground">10 PM - 4 AM</p>
                </div>
              </div>
              <div className="text-2xl font-black text-blue-400">{behavioralStats?.lateNightSpends}</div>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-orange-500/10 transition-colors group-hover:bg-orange-500/20">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Weekend Spikes</p>
                  <p className="text-xs text-muted-foreground">Fri - Sun</p>
                </div>
              </div>
              <div className="text-2xl font-black text-orange-400">{behavioralStats?.weekendSpends}</div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2 italic">
                * Late night spending is often 3x more impulsive than morning activity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Nudge */}
        <Card className="glass-card border-none shadow-lg bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" /> AI Active Nudge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-background/50 border border-primary/10 shadow-sm">
              <Badge className="mb-2 bg-primary/20 text-primary-foreground border-none">
                {activeNudge?.intensity} Intensity
              </Badge>
              <p className="font-semibold text-lg leading-tight mb-2">
                {activeNudge?.message}
              </p>
              <p className="text-sm text-muted-foreground">
                Our engine predicts a spike in {userProfile?.dominantCategory} today.
              </p>
            </div>
            <Button className="w-full gap-2 py-4 h-auto text-sm md:text-base font-bold shadow-lg leading-snug text-center flex items-center justify-center px-4 btn-premium border-none">
              <span className="flex-1">{activeNudge?.suggestedAction}</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </Button>
          </CardContent>
        </Card>

        {/* Habit Tips */}
        <Card className="glass-card border-none shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-green-500" /> Smart Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              </div>
              <p className="text-sm leading-relaxed">
                <strong className="block text-green-700 mb-0.5">The 24-Hour Rule</strong> 
                Wait one day before completing any purchase over ₹2,000.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
              </div>
              <p className="text-sm leading-relaxed">
                <strong className="block text-blue-700 mb-0.5">Subscription Sweep</strong> 
                You have 2 unused services. Cancelling them could save ₹1,500/mo.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1.5 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
              </div>
              <p className="text-sm leading-relaxed">
                <strong className="block text-purple-700 mb-0.5">Round-up Growth</strong> 
                Investing ₹10 from every transaction could build ₹30k this year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Insight Chart */}
      <Card className="glass-card border-none shadow-lg">
        <CardHeader>
          <CardTitle>Behavioral Trend</CardTitle>
          <CardDescription>Impulse spending patterns over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { day: "Mon", score: 20 },
                { day: "Tue", score: 25 },
                { day: "Wed", score: 65 },
                { day: "Thu", score: 45 },
                { day: "Fri", score: 85 },
                { day: "Sat", score: 95 },
                { day: "Sun", score: 40 },
              ]}>
                <defs>
                  {COLORS.map((color, idx) => (
                    <linearGradient key={`gradient-${idx}`} id={`barGradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#9CA3AF' }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.4)', radius: 10 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(8px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: 'bold' 
                  }}
                 />
                <Bar 
                  dataKey="score" 
                  radius={[10, 10, 10, 10]}
                  maxBarSize={50}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                >
                  {
                    [20, 25, 65, 45, 85, 95, 40].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#barGradient-${index % COLORS.length})`} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
