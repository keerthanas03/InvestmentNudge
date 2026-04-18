import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  BellRing, 
  PieChart, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";

const features = [
  {
    title: "Spending Tracker",
    desc: "Real-time categorization of every penny spent using advanced behavioral mapping.",
    icon: BarChart3,
    color: "bg-[#14B8A6] shadow-[0_8px_16px_rgba(20,184,166,0.3)]",
  },
  {
    title: "Nudge Engine",
    desc: "Autonomous nudges that prevent impulse buys before you even click pay.",
    icon: BellRing,
    color: "bg-[#A78BFA] shadow-[0_8px_16px_rgba(167,139,250,0.3)]",
  },
  {
    title: "Budget Limits",
    desc: "Intelligent thresholds that adapt to your historical goals and income flow.",
    icon: PieChart,
    color: "bg-[#FACC15] shadow-[0_8px_16px_rgba(250,204,21,0.3)]",
  },
  {
    title: "Impulse Control",
    desc: "Friction-based checks that provide a 5-second pause for non-essential spends.",
    icon: ShieldAlert,
    color: "bg-[#EC4899] shadow-[0_8px_16px_rgba(236,72,153,0.3)]",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-[#FDF2F8] px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-[#1F2937] mb-4"
          >
            Intelligent Core Features
          </motion.h2>
          <p className="text-lg text-[#6B7280] font-medium max-w-2xl mx-auto opacity-70">
            Our autonomous system works in the background so you can build wealth 
            without changing your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-white hover:border-[#EC4899]/30 transition-all flex flex-col h-full group shadow-xl shadow-pink-100"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 text-white ${feature.color}`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1F2937] mb-3">{feature.title}</h3>
              <p className="text-[#6B7280] font-medium leading-relaxed mb-6 flex-1 text-sm">
                {feature.desc}
              </p>
              <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#EC4899] group-hover:gap-3 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
