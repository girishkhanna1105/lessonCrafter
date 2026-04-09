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
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] overflow-hidden pt-32 px-6">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      
      <div className="max-w-5xl w-full relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Welcome Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                Welcome Back, {user.name?.split(' ')[0] || 'Explorer'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
              Ready to <span className="text-gradient">Craft</span><br />Something New?
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-medium">
              Your AI-powered studio is ready. Choose a topic and let Gemini transform complex information into an interactive learning experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={() => router.push('/page2')}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Start New Draft
              </button>
              <button 
                onClick={() => router.push('/lessons')}
                className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <History className="w-5 h-5 text-indigo-400" />
                View My History
              </button>
            </div>
          </div>

          {/* Quick Stats/Actions Card */}
          <div className="w-full max-w-md">
            <div className="glass-card p-8 border-indigo-500/20 relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 rounded-[2rem] blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative space-y-6">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Workspace Status</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-black">Active Session</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group/item cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/lessons')}>
                    <span className="text-sm font-medium text-gray-300">Continue latest lesson</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover/item:text-indigo-400 group-hover/item:translate-x-1 transition-all" />
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group/item cursor-pointer hover:bg-white/10 transition-colors" onClick={() => router.push('/lessons')}>
                    <span className="text-sm font-medium text-gray-300">Explore community archive</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover/item:text-indigo-400 group-hover/item:translate-x-1 transition-all" />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        {String.fromCharCode(64+i)}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-background bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                      +12
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lessons Crafted Overall</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
