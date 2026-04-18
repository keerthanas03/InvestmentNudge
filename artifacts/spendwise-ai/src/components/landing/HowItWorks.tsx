import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Sync Your Accounts",
    desc: "Connect your bank accounts securely. We use tier-1 bank-level encryption (AES-256) to ensure your data stays private.",
  },
  {
    num: "02",
    title: "Define Your Goals",
    desc: "Tell the AI what you're saving for. Whether it's a dream home or early retirement, our engine calculates the optimum path.",
  },
  {
    num: "03",
    title: "Automate Growth",
    desc: "Relax as the AI detects overspends and automatically redirects those funds into your chosen investment vehicles.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-[#F5F5F5] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-extrabold text-[#121212] mb-6"
            >
              How it works in 3 <br /> simple steps
            </motion.h2>
            <p className="text-lg text-[#3A3A3A] opacity-70 mb-10 leading-relaxed">
              We've redesigned financial planning from the ground up to be autonomous, 
              invisible, and highly effective.
            </p>
            <div className="space-y-4">
               <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="font-black text-2xl text-[#D1D1D1]">1M+</div>
                  <div className="text-sm font-bold text-[#3A3A3A]">Transactions analyzed daily</div>
               </div>
               <div className="p-6 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="font-black text-2xl text-[#D1D1D1]">$50M</div>
                  <div className="text-sm font-bold text-[#3A3A3A]">Investments autonomously managed</div>
               </div>
            </div>
          </div>

          <div className="space-y-12">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex gap-6 items-start"
              >
                <div className="text-4xl font-black text-[#D1D1D1] leading-none">{step.num}</div>
                <div>
                  <h3 className="text-xl font-bold text-[#121212] mb-2">{step.title}</h3>
                  <p className="text-[#3A3A3A] opacity-70 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
