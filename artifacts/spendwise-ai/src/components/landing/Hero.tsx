import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, ShieldCheck, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden bg-[#F5E6EA]">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#EC4899]/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto text-center relative">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest text-[#EC4899]">
            AI-Driven Wealth Generation
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold text-[#1F2937] leading-tight mb-6 max-w-4xl mx-auto"
        >
          Turn Your Spending Into <br />
          <span className="text-[#EC4899]">Smart Investments</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
        >
          The intelligent financial nudge engine that monitors your spending habits and 
          autonomously converts overspends into diversified investment assets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4"
        >
          <Link href="/signup" className="w-full md:w-auto">
            <button className="w-full btn-gradient text-white px-8 py-4 rounded-full text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-xl group">
              Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="w-full md:w-auto bg-white/60 backdrop-blur-md text-[#1F2937] border border-white px-8 py-4 rounded-full text-lg font-bold hover:bg-white transition-all">
            See How it Works
          </button>
        </motion.div>

        {/* Floating Badges */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1, duration: 1 }}
           className="hidden lg:block"
        >
            <HeroBadge 
                icon={<TrendingUp className="w-4 h-4 text-green-500" />} 
                label="+18% Avg Return" 
                pos="top-0 left-[10%]" 
                delay={0}
            />
            <HeroBadge 
                icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} 
                label="Tier-1 Security" 
                pos="bottom-[20%] right-[10%]" 
                delay={0.2}
            />
            <HeroBadge 
                icon={<Zap className="w-4 h-4 text-yellow-500" />} 
                label="Real-time Nudges" 
                pos="top-[20%] right-[15%]" 
                delay={0.4}
            />
        </motion.div>
      </div>
    </section>
  );
};

const HeroBadge = ({ icon, label, pos, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
        className={`absolute ${pos} flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-xl`}
    >
        {icon}
        <span className="text-sm font-bold text-[#121212]">{label}</span>
    </motion.div>
);
