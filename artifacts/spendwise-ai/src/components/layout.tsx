import React from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ReceiptText,
  Tags,
  PieChart,
  BellRing,
  TrendingUp,
  ShieldAlert,
  Trophy,
  Settings,
  Zap,
  Calculator,
  BrainCircuit,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/nudges", label: "Nudge Engine", icon: BellRing },
    { href: "/investments", label: "Investments", icon: TrendingUp },
    { href: "/impulse-controls", label: "Impulse Controls", icon: ShieldAlert },
    { href: "/ai-coach", label: "AI Coach", icon: BrainCircuit },
    { href: "/gamification", label: "Gamification", icon: Trophy },
    { href: "/planner", label: "Big Purchase Planner", icon: Calculator },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex p-4 gap-4 overflow-hidden relative">
      {/* Sidebar - Floating Premium */}
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-72 sidebar-bg hidden lg:flex flex-col z-30 relative group shadow-2xl overflow-hidden rounded-[2rem]"
      >
        <div className="p-8 pb-10">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group/logo">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#A78BFA] flex items-center justify-center shadow-xl shadow-pink-200/50 group-hover/logo:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-[#4B5563] logo-shimmer">
                Investment Nudger
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item, i) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + (i * 0.05) }}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl cursor-pointer transition-all duration-300 group ${
                    isActive
                      ? "sidebar-active shadow-lg translate-x-1"
                      : "text-[#9CA3AF] hover:bg-white/60 hover:text-[#FBB6CE] hover:translate-x-1"
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-[#EC4899]" : ""}`} />
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  {isActive && (
                    <motion.div 
                        layoutId="active-pill"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-[#EC4899] shadow-[0_0_8px_#EC4899]" 
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto">
           <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#EC4899]/10 to-[#A78BFA]/10 border border-white/40 shadow-sm relative overflow-hidden group/upgrade">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/20 rounded-full blur-2xl group-hover/upgrade:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-widest text-[#FBB6CE] mb-1">Premium Plan</p>
              <p className="text-sm font-black text-[#4B5563] mb-4">Bloom into Savings 🌸</p>
              <button className="w-full py-2.5 btn-premium rounded-xl text-xs font-black shadow-sm transition-all active:scale-95">Upgrade Pro</button>
           </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10 z-20 custom-scrollbar relative bg-white/30 rounded-[3rem] border border-white/40 backdrop-blur-md">
        <ScrollArea className="h-full">
           {children}
        </ScrollArea>

        {/* Floating Decoration Orbs */}
        <div className="fixed top-20 right-20 w-96 h-96 bg-[#A78BFA]/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />
        <div className="fixed bottom-20 left-20 w-80 h-80 bg-[#EC4899]/10 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse" 
             style={{ animationDelay: '2s' }} />
      </main>
    </div>
  );
}
