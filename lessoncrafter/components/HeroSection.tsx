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
      router.push("/page2");
    }
  };

  const handleGenerate = () => {
    if (!user) {
      router.push("/auth");
    } else {
      // We could pass the prompt to page2 via localStorage or query
      if (prompt.trim()) {
        localStorage.setItem("pending_prompt", prompt);
      }
      router.push("/page2");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden pt-36 sm:pt-40">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />

      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-8 animate-float">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-semibold text-indigo-200 tracking-wide uppercase">
          AI-Powered Learning Platform
        </span>
      </div>

      {/* HEADLINE SECTION */}
      <div className="text-center max-w-5xl mx-auto px-6 relative z-10">
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-6">
          <span className="text-white">Master Any Topic with</span>
          <br />
          <span className="text-gradient">
            Intelligent Lessons
          </span>
        </h1>
        
        <p className="mt-8 max-w-2xl mx-auto text-xl text-gray-400 font-medium leading-relaxed">
          The AI-native engine for generating interactive, executable lessons, 
          quizzes, and study guides in seconds. Elevate your learning journey today.
        </p>
      </div>

      {/* CTA SECTION */}
      <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
        <button 
          onClick={handleStartCreating}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 group active:scale-95"
        >
          Start Creating Now
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => router.push("/lessons")}
          className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all active:scale-95"
        >
          View Public Lessons
        </button>
      </div>

      {/* INPUT PREVIEW / MOCKUP */}
      <div className="mt-20 w-full max-w-3xl px-6 relative z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative glass-card p-2 rounded-[1.5rem]">
          <div className="bg-black/40 rounded-2xl flex items-center p-3 gap-2 border border-white/5">
            <input 
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Create a comprehensive lesson on Quantum Computing fundamentals..."
              className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-600 focus:outline-none"
            />
            <button 
              onClick={handleGenerate}
              className="bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform whitespace-nowrap"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}