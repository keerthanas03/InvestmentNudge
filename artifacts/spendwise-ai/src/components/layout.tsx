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
  Zap,
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
    <div className="min-h-screen flex flex-col md:flex-row glass-bg">
      {/* Decorative green orbs in background */}
      <div
        className="green-orb"
        style={{
          width: 400,
          height: 400,
          top: "5%",
          left: "15%",
          background: "rgba(34, 197, 94, 0.09)",
        }}
      />
      <div
        className="green-orb"
        style={{
          width: 300,
          height: 300,
          bottom: "10%",
          right: "10%",
          background: "rgba(16, 185, 129, 0.07)",
        }}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-0 md:h-screen md:overflow-y-auto glass-sidebar z-10">
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md"
              style={{
                background: "linear-gradient(135deg, hsl(150,100%,25%), hsl(160,80%,35%))",
                boxShadow: "0 4px 14px rgba(34,197,94,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight logo-shimmer">
              Investment Nudger
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 mb-3 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.2), transparent)" }} />

        {/* Nav */}
        <nav className="px-3 pb-6 space-y-0.5">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative group ${
                  isActive
                    ? "glass-nav-active text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={!isActive ? undefined : undefined}
              >
                {!isActive && (
                  <span
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "rgba(34, 197, 94, 0.07)",
                      border: "1px solid rgba(34, 197, 94, 0.10)",
                    }}
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 ${isActive ? "drop-shadow-sm" : ""}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom badge */}
        <div className="mx-4 mt-auto mb-5">
          <div
            className="px-3 py-2 rounded-xl text-xs text-center font-medium"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.18)",
              color: "hsl(150, 100%, 25%)",
            }}
          >
            💡 Nudge your way to wealth
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
