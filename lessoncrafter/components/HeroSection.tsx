"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, BookOpen, Zap, Atom, BrainCircuit, Sigma, Dna } from "lucide-react";

const POPULAR_TOPICS = [
  { label: "Transformer Attention", prompt: "Transformers: Self-Attention Mechanics & Q/K/V Matrices", icon: BrainCircuit },
  { label: "Quantum Entanglement", prompt: "Quantum Computing: Superposition, Entanglement & Bell States", icon: Atom },
  { label: "Calculus Optimization", prompt: "Calculus: Multivariable Optimization & Lagrange Multipliers", icon: Sigma },
  { label: "CRISPR Gene Editing", prompt: "CRISPR-Cas9: Gene Editing Mechanism & Applications", icon: Dna },
];

export default function HeroSection() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleCreate = (topicText?: string) => {
    const text = topicText || prompt;
    if (text.trim()) {
      localStorage.setItem("pending_prompt", text.trim());
    }
    router.push("/studio");
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[92vh] pt-32 sm:pt-36 pb-16 px-4 overflow-hidden">

      {/* ── Background depth ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary cobalt top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cobalt-600/[0.09] dark:bg-cobalt-500/[0.14] rounded-full blur-[150px]" />
        {/* Cyan bottom-right accent */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-marine-500/[0.07] dark:bg-marine-500/[0.1] rounded-full blur-[120px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Main Content ── */}
      <div className="text-center max-w-4xl mx-auto relative z-10">

        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cobalt-50 dark:bg-cobalt-950/50 border border-cobalt-200/70 dark:border-cobalt-800/60 shadow-sm mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 animate-pulse" />
          <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
          <span className="text-xs font-semibold text-cobalt-700 dark:text-cobalt-300 tracking-wide">
            Interactive Learning Reimagined
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.07] mb-6">
          Learn any concept through{" "}
          <br className="hidden sm:block" />
          <span className="relative inline-block">
            <span className="text-gradient">hands-on discovery</span>
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-cobalt-500 to-marine-500 rounded-full opacity-50" />
          </span>
        </h1>

        <p className="mb-10 max-w-2xl mx-auto text-base sm:text-lg text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          Type any topic in math, physics, or computer science. Get an interactive 
          parameter simulator, rigorous first-principles explanations, and practice 
          questions tailored to your level.
        </p>

        {/* ── Big input bar ── */}
        <div className="max-w-2xl mx-auto mb-10">
          <form
            onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
            className="flex items-stretch bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none transition-all duration-200 focus-within:border-cobalt-400 dark:focus-within:border-cobalt-500 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] dark:focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] overflow-hidden"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to learn? e.g. How does backpropagation work?"
              className="flex-1 bg-transparent pl-5 pr-3 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base focus:outline-none"
            />
            <button
              type="submit"
              className="m-2 px-6 py-3 bg-cobalt-600 hover:bg-cobalt-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-cobalt-600/25 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Build Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick-start chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Try:</span>
            {POPULAR_TOPICS.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleCreate(topic.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/40 hover:border-cobalt-300/50 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-cobalt-500 dark:text-cobalt-400" />
                  {topic.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social proof link */}
        <button
          onClick={() => router.push("/lessons")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-cobalt-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-cobalt-500" />
          Browse community lessons — 50+ topics available
        </button>

      </div>
    </section>
  );
}
