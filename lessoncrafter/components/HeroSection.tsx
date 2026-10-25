"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  const [prompt, setPrompt] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleStartCreating = () => {
    if (!user) {
      router.push("/auth");
    } else {
      router.push("/studio");
    }
  };

  const handleGenerate = () => {
    if (!user) {
      router.push("/auth");
    } else {
      if (prompt.trim()) {
        localStorage.setItem("pending_prompt", prompt);
      }
      router.push("/studio");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden pt-36 sm:pt-40 px-4">
      {/* Background Architectural Ambient Accents - NO PURPLE */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cobalt-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-marine-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 animate-float">
        <Sparkles className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
        <span className="text-xs font-bold text-slate-800 dark:text-cobalt-200 tracking-wide uppercase font-mono">
          AI-Native Educational Studio
        </span>
      </div>

      {/* HEADLINE SECTION */}
      <div className="text-center max-w-5xl mx-auto px-4 relative z-10">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6">
          <span className="text-slate-900 dark:text-white">Master Any Topic with</span>
          <br />
          <span className="text-gradient">
            Intelligent Lessons
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          The next-generation engine for synthesizing interactive, executable lessons, 
          simulators, and formative quizzes in seconds.
        </p>
      </div>

      {/* CTA SECTION */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
        <button 
          onClick={handleStartCreating}
          className="px-8 py-4 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-cobalt-600/25 flex items-center justify-center gap-2 group active:scale-95 cursor-pointer"
        >
          Start Creating Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => router.push("/lessons")}
          className="px-8 py-4 glass text-slate-800 dark:text-white font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all active:scale-95 cursor-pointer"
        >
          Explore Library
        </button>
      </div>

      {/* INPUT PREVIEW / QUICK PROMPT LAUNCHER */}
      <div className="mt-16 w-full max-w-3xl px-4 relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cobalt-600 to-marine-500 rounded-[2rem] blur opacity-20 group-hover:opacity-35 transition duration-500"></div>
        <div className="relative glass-card p-2 rounded-[1.5rem]">
          <div className="bg-white/60 dark:bg-slate-950/80 rounded-2xl flex items-center p-2.5 gap-2 border border-slate-200/80 dark:border-white/5">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Quantum Computing: Superposition & Bloch sphere simulation..."
              className="flex-1 bg-transparent px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm sm:text-base font-sans"
            />
            <button 
              onClick={handleGenerate}
              className="bg-cobalt-600 hover:bg-cobalt-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-cobalt-600/20 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}