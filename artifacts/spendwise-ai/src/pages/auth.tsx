import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Zap, Mail, Lock, User, ArrowRight, ArrowLeft, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(location === "/login");

  useEffect(() => {
    setIsLogin(location === "/login");
  }, [location]);

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setLocation(newMode ? "/login" : "/signup", { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      setLocation("/dashboard");
    } else {
      // Registration flow: Switch to login mode
      toggleMode();
      alert("Account created successfully! Please log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 glass-bg overflow-hidden relative">
      <div className="w-full max-w-4xl h-[640px] bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/40">
        
        {/* Forms Container */}
        <div className="absolute inset-0 flex">
          {/* Left Side (Login Form) */}
          <div className="w-1/2 flex items-center justify-center p-12">
            <AnimatePresence mode="wait">
              {isLogin && (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-8"
                >
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-[#1F2937] mb-2 tracking-tight">Welcome Back</h2>
                    <p className="text-[#6B7280] font-medium opacity-60">Sign in to your account</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#EC4899] ml-1">Email</label>
                       <div className="relative">
                         <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#EC4899] ml-1">Password</label>
                       <div className="relative">
                         <Lock className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl btn-gradient text-white font-bold group shadow-xl">
                      Log In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side (Register Form) */}
          <div className="w-1/2 flex items-center justify-center p-12">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4 }}
                  className="w-full space-y-6"
                >
                  <div className="text-center md:text-left">
                    <h2 className="text-3xl font-black text-[#1F2937] mb-2 tracking-tight">Create Account</h2>
                    <p className="text-[#6B7280] font-medium opacity-60">Join our financial nudge network</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#EC4899] ml-1">Username</label>
                       <div className="relative">
                         <User className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="text" 
                            placeholder="investor_01" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#EC4899] ml-1">Email</label>
                       <div className="relative">
                         <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#EC4899] ml-1">Mobile Number</label>
                       <div className="relative">
                         <Phone className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="tel" 
                            placeholder="+91 98765 43210" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px) font-black uppercase tracking-widest text-[#EC4899] ml-1">Password</label>
                       <div className="relative">
                         <Lock className="absolute left-3 top-3.5 w-4 h-4 text-[#A78BFA]" />
                         <Input 
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10 h-12 rounded-xl bg-white/50 border-white focus:ring-2 focus:ring-[#A78BFA] transition-all"
                            required
                         />
                       </div>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl btn-gradient text-white font-bold group shadow-xl">
                      Create Account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sliding Panel (Overlay) */}
        <motion.div
           animate={{ x: isLogin ? "100%" : "0%" }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
           className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[#EC4899] to-[#A78BFA] z-20 flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden shadow-2xl"
        >
          {/* Background Subtle Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />

          <div className="relative z-30 space-y-6">
             <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-xl">
                <Zap className="w-8 h-8 text-white" />
             </div>

             <AnimatePresence mode="wait">
               {isLogin ? (
                 <motion.div
                   key="to-register"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                 >
                   <h3 className="text-3xl font-black mb-4">New Here?</h3>
                   <p className="text-white/80 font-medium mb-8 leading-relaxed">
                     Start your autonomous investing journey in seconds with our premium AI suite.
                   </p>
                   <button 
                     onClick={toggleMode}
                     className="px-10 py-3 rounded-full border-2 border-white/20 font-bold hover:bg-white hover:text-[#EC4899] transition-all active:scale-95"
                   >
                     Create Account
                   </button>
                 </motion.div>
               ) : (
                 <motion.div
                   key="to-login"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.3 }}
                 >
                   <h3 className="text-3xl font-black mb-4 tracking-tight">Welcome Back!</h3>
                   <p className="text-white/80 font-medium mb-8 leading-relaxed">
                     Already a member? Log in to manage your nudges and growth.
                   </p>
                   <button 
                     onClick={toggleMode}
                     className="px-10 py-3 rounded-full border-2 border-white/20 font-bold hover:bg-white hover:text-[#EC4899] transition-all active:scale-95"
                   >
                     Log In
                   </button>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </motion.div>

        {/* Home Back Button (Floating) */}
        <Link href="/">
           <button className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#EC4899] transition-colors flex items-center gap-1 opacity-50 hover:opacity-100 group">
             <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Home
           </button>
        </Link>
      </div>
    </div>
  );
}
