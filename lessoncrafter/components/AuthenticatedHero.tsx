"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Plus, History, Sparkles, BookOpen, ChevronRight } from "lucide-react";

interface AuthenticatedHeroProps {
  user: any;
}

export default function AuthenticatedHero({ user }: AuthenticatedHeroProps) {
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden pt-36 sm:pt-40 px-6">
      {/* Dynamic Background - Cobalt Architectural Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cobalt-600/10 dark:bg-cobalt-500/15 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-5xl w-full relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Welcome Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-cobalt-200 uppercase tracking-widest">
                Welcome Back, {user.name?.split(' ')[0] || 'Explorer'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              Ready to <span className="text-gradient">Craft</span><br />Something New?
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
              Your AI-native creation studio is primed. Synthesize rigorous curricula, interactive simulations, and formative checks in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => router.push('/studio')}
                className="px-8 py-4 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cobalt-600/25 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                Launch Studio
              </button>
              <button 
                onClick={() => router.push('/lessons')}
                className="px-8 py-4 glass text-slate-800 dark:text-white font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <History className="w-5 h-5 text-cobalt-600 dark:text-cobalt-400" />
                View Library
              </button>
            </div>
          </div>

          {/* Quick Stats/Actions Card */}
          <div className="w-full max-w-md">
            <div className="glass-card p-8 border-slate-200/80 dark:border-slate-800 relative group">
              <div className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-cobalt-500/10 flex items-center justify-center border border-cobalt-500/20">
                    <BookOpen className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400" />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold">Workspace Ready</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold">Active Session</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div 
                    onClick={() => router.push('/studio')}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between group/item cursor-pointer hover:border-cobalt-500/40 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Open new creation draft</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-cobalt-500 group-hover/item:translate-x-1 transition-all" />
                  </div>
                  <div 
                    onClick={() => router.push('/lessons')}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between group/item cursor-pointer hover:border-cobalt-500/40 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Explore community archive</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-cobalt-500 group-hover/item:translate-x-1 transition-all" />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">Role: {user.role || 'Student'}</span>
                  <span className="text-[10px] text-cobalt-600 dark:text-cobalt-400 font-mono font-bold uppercase tracking-wider">
                    Cobalt Engine Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
