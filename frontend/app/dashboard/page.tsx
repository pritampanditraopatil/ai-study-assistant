"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/AppShell";
import { 
  ArrowRight, 
  BrainCircuit, 
  BookOpen, 
  Layers, 
  Target, 
  Clock, 
  Zap,
  TrendingUp,
  Award,
  PlayCircle,
  Activity
} from "lucide-react";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 100, damping: 20 } 
  }
};

// --- Dummy Stats ---
const DUMMY_STATS = {
  totalNotes: 24,
  flashcards: 156,
  studyHours: 42.5,
  accuracy: 88,
  tutorSessions: 12,
  activeSubjects: 4,
  focusScore: 92,
  retention: 85,
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppShell crumbs={[{ label: "Dashboard" }]}>
      <div className="w-full h-full max-w-[1400px] mx-auto px-4 pb-12 pt-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-2 font-display">
              Overview
            </h1>
            <p className="text-[#a3a3a3] text-sm tracking-wide">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="h-10 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors">
              Customize
            </button>
            <button className="h-10 px-5 rounded-full bg-[var(--color-orange)] text-white text-sm font-bold shadow-[0_0_20px_var(--color-orange-faint)] hover:bg-[#ff6a33] transition-all">
              Start Session
            </button>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]"
        >
          
          {/* 1. Large Central Feature Card (Span 2) */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 row-span-2 group relative overflow-hidden rounded-[24px] bg-[#0d0d0d] border border-white/5 p-8 flex flex-col justify-between">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[var(--color-orange)]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMSIvPjwvc3ZnPg==')] opacity-50" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-orange)]/10 border border-[var(--color-orange)]/20 text-[var(--color-orange)] text-xs font-bold tracking-wider uppercase mb-6">
                <Zap size={12} fill="currentColor" /> System Online
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white leading-[1.1] mb-4">
                Your mind,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#666]">amplified.</span>
              </h2>
              <p className="text-[#a3a3a3] max-w-[280px] text-sm leading-relaxed mb-8">
                The neural core has processed 3 new documents. You have 14 active connections waiting to be explored.
              </p>
            </div>
            
            <div className="relative z-10 flex items-center justify-between mt-auto">
              <button className="flex items-center gap-2 h-12 px-6 rounded-full bg-white text-black text-sm font-bold hover:scale-105 transition-transform group-hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Enter Flow State <ArrowRight size={16} />
              </button>
              
              {/* Abstract Brain Viz Graphic (CSS only) */}
              <div className="relative w-24 h-24 hidden sm:block">
                <div className="absolute inset-0 border border-white/20 rounded-full animate-[breathe_4s_ease-in-out_infinite]" />
                <div className="absolute inset-2 border border-[var(--color-orange)]/40 rounded-full animate-[breathe_3s_ease-in-out_infinite_reverse]" />
                <div className="absolute inset-4 bg-[var(--color-orange)]/20 blur-md rounded-full animate-pulse" />
                <BrainCircuit size={32} className="absolute inset-0 m-auto text-[var(--color-orange)] drop-shadow-[0_0_10px_var(--color-orange)]" />
              </div>
            </div>
          </motion.div>

          {/* 2. Top Right Stats (Study Hours & Accuracy) */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 row-span-1 rounded-[24px] bg-[#111] border border-white/5 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 text-[#a3a3a3] text-sm font-medium mb-3">
              <Clock size={16} /> Study Hours
            </div>
            <div className="text-4xl font-bold tracking-tighter text-white tabular-nums">
              {DUMMY_STATS.studyHours}<span className="text-2xl text-[#666]">h</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
              <div className="h-full bg-white w-[65%]" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 row-span-1 rounded-[24px] bg-[var(--color-orange)] p-6 flex flex-col justify-center relative overflow-hidden group shadow-[0_0_30px_var(--color-orange-faint)]">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-white/90 text-sm font-bold mb-3 uppercase tracking-wider">
              <Target size={16} /> Accuracy
            </div>
            <div className="text-4xl font-bold tracking-tighter text-white tabular-nums">
              {DUMMY_STATS.accuracy}<span className="text-2xl opacity-80">%</span>
            </div>
            <p className="text-white/80 text-xs mt-2 font-medium">+4% from last week</p>
          </motion.div>

          {/* 3. Mid Right Stats (Notes & Flashcards) */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 row-span-1 rounded-[24px] bg-[#111] border border-white/5 p-6 flex items-center justify-between hover:bg-[#141414] transition-colors">
            <div className="flex-1 border-r border-white/10 pr-6">
              <div className="flex items-center gap-2 text-[#a3a3a3] text-sm font-medium mb-2">
                <BookOpen size={16} /> Notes Uploaded
              </div>
              <div className="text-3xl font-bold tracking-tighter text-white tabular-nums">{DUMMY_STATS.totalNotes}</div>
            </div>
            <div className="flex-1 pl-6">
              <div className="flex items-center gap-2 text-[#a3a3a3] text-sm font-medium mb-2">
                <Layers size={16} /> Flashcards
              </div>
              <div className="text-3xl font-bold tracking-tighter text-white tabular-nums">{DUMMY_STATS.flashcards}</div>
            </div>
          </motion.div>

          {/* 4. Analytics Section (Weekly Activity) */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-2 row-span-2 rounded-[24px] bg-[#0d0d0d] border border-white/5 p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Activity size={18} className="text-[var(--color-orange)]" /> Weekly Activity
              </h3>
              <span className="text-xs text-[#a3a3a3] bg-white/5 px-3 py-1 rounded-full border border-white/10">This Week</span>
            </div>
            
            {/* Minimalist Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 mt-auto pt-6">
              {[40, 70, 45, 90, 60, 30, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full bg-white/5 rounded-t-sm relative group cursor-pointer transition-all hover:bg-white/10" style={{ height: '140px' }}>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: 0.2 + (i * 0.1), ease: "easeOut" }}
                      className={`absolute bottom-0 w-full rounded-t-sm ${i === 3 ? 'bg-[var(--color-orange)]' : 'bg-white/20 group-hover:bg-white/30'}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#666] uppercase tracking-wider">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 5. Smart AI Widget: Today's Revision */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 row-span-2 rounded-[24px] bg-[#111] border border-white/5 p-6 flex flex-col relative overflow-hidden group">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
              <TrendingUp size={18} className="text-[#a3a3a3]" /> Revision Queue
            </div>
            
            <div className="flex flex-col gap-4">
              {[
                { title: "Process Scheduling", type: "OS", color: "bg-blue-500" },
                { title: "Binary Trees", type: "DSA", color: "bg-green-500" },
                { title: "Normalization", type: "DBMS", color: "bg-purple-500" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-[#666] text-xs font-bold tracking-wider">{item.type}</p>
                  </div>
                  <PlayCircle size={16} className="text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <button className="mt-auto w-full h-10 rounded-xl bg-white/5 text-[#a3a3a3] text-sm font-medium hover:bg-white/10 hover:text-white transition-colors border border-white/5">
              View All
            </button>
          </motion.div>

          {/* 6. Smart AI Widget: Focus Score */}
          <motion.div variants={itemVariants} className="md:col-span-1 lg:col-span-1 row-span-1 rounded-[24px] bg-[#111] border border-white/5 p-6 flex items-center justify-between">
             <div>
              <div className="flex items-center gap-2 text-[#a3a3a3] text-sm font-medium mb-1">
                <Award size={16} /> Focus Score
              </div>
              <div className="text-3xl font-bold tracking-tighter text-white tabular-nums">{DUMMY_STATS.focusScore}</div>
             </div>
             
             {/* Circular Progress (CSS Hack) */}
             <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-[#0a0a0a]">
                <svg className="w-full h-full -rotate-90 absolute inset-0">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke="var(--color-orange)" strokeWidth="6" strokeDasharray="175" strokeDashoffset="20" strokeLinecap="round" />
                </svg>
                <span className="text-[10px] font-bold text-white relative z-10">High</span>
             </div>
          </motion.div>

        </motion.div>

      </div>
    </AppShell>
  );
}
