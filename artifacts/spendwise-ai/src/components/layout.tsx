import React from "react";
import { Link, useLocation } from "wouter";
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
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: ReceiptText },
    { href: "/categories", label: "Categories", icon: Tags },
    { href: "/budgets", label: "Budgets", icon: PieChart },
    { href: "/nudges", label: "Nudge Engine", icon: BellRing },
    { href: "/investments", label: "Investments", icon: TrendingUp },
    { href: "/impulse-controls", label: "Impulse Controls", icon: ShieldAlert },
    { href: "/gamification", label: "Gamification", icon: Trophy },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-border bg-sidebar shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <TrendingUp className="w-6 h-6" />
            SpendWise AI
          </div>
        </div>
        <nav className="px-4 pb-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
