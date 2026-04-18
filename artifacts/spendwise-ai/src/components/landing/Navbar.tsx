import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Zap } from "lucide-react";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 py-4 ${
        scrolled ? "bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-pink-200">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#1F2937]">
            Investment Nudger
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Pricing", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-bold text-[#6B7280] hover:text-[#EC4899] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden md:flex text-sm font-bold">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <button className="btn-gradient px-7 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

const Button = ({ children, variant, className }: any) => {
  const base = "px-4 py-2 rounded-full transition-all duration-200";
  const variants: any = {
    ghost: "hover:bg-white/40 text-[#6B7280] hover:text-[#EC4899]",
    primary: "bg-gradient-to-br from-[#EC4899] to-[#A78BFA] text-white",
  };
  return <button className={`${base} ${variants[variant] || ""} ${className}`}>{children}</button>;
};
