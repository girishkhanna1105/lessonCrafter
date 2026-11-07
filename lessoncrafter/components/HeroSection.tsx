"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, BookOpen, Layers } from "lucide-react";

const POPULAR_TOPICS = [
  "Quantum Computing & Bell States",
  "Transformer Self-Attention",
  "CRISPR Gene Editing",
  "Calculus Optimization",
];

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

  const handleCreate = (topicText?: string) => {
    const text = topicText || prompt;
    if (text.trim()) {
      localStorage.setItem("pending_prompt", text.trim());
    }
    if (!user) {
      router.push("/studio");
    } else {
      router.push("/studio");
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] pt-32 sm:pt-36 pb-16 px-4 overflow-hidden">
      
      {/* Subtle modern background radial gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cobalt-600/10 dark:bg-cobalt-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="text-center max-w-4xl mx-auto px-4 relative z-10">
        
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 mb-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
          <span>Interactive Learning Reimagined</span>
        </div>

        {/* Human Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Learn any concept through <br className="hidden sm:block" />
          <span className="text-gradient">hands-on discovery</span>
        </h1>
        
        <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
          Type any topic in math, physics, or computer science. Get an interactive parameter simulator, rigorous first-principles explanations, and practice questions tailored to your level.
        </p>

        {/* Search / Topic Input Desk */}
        <div className="mt-8 max-w-2xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCreate();
            }}
            className="p-2 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col sm:flex-row items-stretch gap-2 transition-all focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-500/20"
          >
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to learn? (e.g. Transformers Attention, Orbital Mechanics...)"
              className="flex-1 bg-transparent px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-cobalt-600/25 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Build Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-Start Suggestions */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try asking for:</span>
            {POPULAR_TOPICS.map((topic, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleCreate(topic)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Navigation / Browse Link */}
        <div className="mt-10 flex items-center justify-center gap-4 text-xs font-semibold">
          <button
            onClick={() => router.push("/lessons")}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-cobalt-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cobalt-500" />
            <span>Browse community lessons ({">"}50 available)</span>
          </button>
        </div>

      </div>
    </section>
  );
}
