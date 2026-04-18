import React from "react";
import { Zap, Twitter, Github, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-20 bg-[#F5E6EA] border-t border-[#EC4899]/10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-pink-200">
                <Zap className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#1F2937]">
                Investment Nudger
              </span>
            </div>
            <p className="text-[#6B7280] font-medium text-sm leading-relaxed max-w-xs opacity-80">
              Empowering individuals to master their financial destiny through autonomous nudge technology and behavior-driven investing.
            </p>
            <div className="flex gap-4">
               {[Twitter, Github, Linkedin, Mail].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-10 h-10 rounded-full bg-white/60 backdrop-blur-md flex items-center justify-center border border-white text-[#EC4899] hover:bg-[#EC4899] hover:text-white transition-all shadow-sm">
                     <Icon className="w-4 h-4" />
                  </a>
               ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Features", "Nudge Engine", "Risk Management", "Security"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"] },
          ].map((col, idx) => (
            <div key={idx}>
              <h4 className="font-extrabold text-[#1F2937] mb-6 uppercase tracking-widest text-[10px]">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a href="#" className="text-sm text-[#6B7280] font-medium hover:text-[#EC4899] transition-colors opacity-80 hover:opacity-100">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-[#EC4899]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-[#6B7280] opacity-60">
            © 2026 Investment Nudger. All rights reserved. Bloom into Savings.
          </p>
          <div className="flex gap-8">
             <a href="#" className="text-[10px] font-bold text-[#6B7280] opacity-40 hover:opacity-100">Security Certificate</a>
             <a href="#" className="text-[10px] font-bold text-[#6B7280] opacity-40 hover:opacity-100">PCI-DSS Compliant</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
