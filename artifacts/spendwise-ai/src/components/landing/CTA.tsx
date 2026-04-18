import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Sparkles } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 bg-[#F5E6EA] px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="relative rounded-[3rem] bg-gradient-to-br from-[#EC4899] to-[#A78BFA] p-10 md:p-20 text-center overflow-hidden shadow-2xl shadow-pink-200"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 border border-white/20">
                <Sparkles className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight max-w-2xl">
               Ready to automate your <br /> financial future?
             </h2>
             <p className="text-lg text-white/80 font-medium mb-10 max-w-xl">
               Join 50,000+ smart spenders who are turning their everyday habits 
               into a compounding investment machine.
             </p>
             <Link href="/signup">
                <button className="group relative bg-white text-[#EC4899] px-10 py-5 rounded-full text-xl font-black hover:scale-105 transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                   Start Your Journey <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                   {/* Glow effect */}
                   <div className="absolute inset-0 -z-10 bg-white blur-2xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" />
                </button>
             </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
