"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Terminal, 
  Atom, 
  BrainCircuit, 
  Sigma, 
  Dna, 
  Sliders, 
  BookOpen, 
  Compass, 
  CornerDownLeft,
  CheckCircle2
} from "lucide-react";

const POPULAR_TOPICS = [
  { 
    domain: "QUANTUM", 
    label: "Superposition & Bell States", 
    prompt: "Quantum Computing: Superposition, Entanglement & Bell States with real-time state vector collapse", 
    icon: Atom 
  },
  { 
    domain: "NEURAL NETWORKS", 
    label: "Transformer Attention & Q/K/V", 
    prompt: "Transformers: Scaled Dot-Product Self-Attention Mechanics & Q/K/V Projection Matrices", 
    icon: BrainCircuit 
  },
  { 
    domain: "CALCULUS", 
    label: "Multivariable Surface Optimization", 
    prompt: "Calculus: Multivariable Optimization, Hessian Matrices & Lagrange Multipliers", 
    icon: Sigma 
  },
  { 
    domain: "GENETICS", 
    label: "CRISPR-Cas9 Cleavage Dynamics", 
    prompt: "CRISPR-Cas9: Molecular Cleavage Mechanism, PAM Recognition & Double-Strand Repair", 
    icon: Dna 
  },
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
    <section className="relative flex flex-col items-center justify-center min-h-[92vh] pt-32 sm:pt-36 pb-20 px-4 overflow-hidden">
      
      {/* ── Precision Technical Grid Background (Replaces AI blur blobs) ── */}
      <div className="absolute inset-0 pointer-events-none select-none">
        {/* Subtle structural grid lines */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px"
          }}
        />
        {/* Top subtle vignette */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
        {/* Bottom subtle vignette */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ── Main Technical Stage ── */}
      <div className="max-w-4xl w-full mx-auto relative z-10 text-center flex flex-col items-center">

        {/* 1. Precision Status Strip (No generic glowing pill with sparkles) */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-8 animate-slide-up">
          <span className="flex items-center gap-1.5 font-semibold text-cobalt-600 dark:text-cobalt-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ENGINE: ACTIVE
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">PARAMETRIC STEM WORKBENCH</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">v2.4 KINETIC</span>
        </div>

        {/* 2. Authoritative Headline (High-contrast, crisp typographical scale) */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-5 max-w-3xl animate-slide-up delay-100">
          Don't just read about complex systems.{" "}
          <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
            Experiment with them.
          </span>
        </h1>

        {/* 3. Serious, grounded subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10 animate-slide-up delay-200">
          Transform any theorem, physical law, or algorithm into an interactive 
          parameter simulation with step-by-step mathematical derivations and Socratic inquiry.
        </p>

        {/* 4. The Instrument Command Console (Replaces generic search box) */}
        <div className="w-full max-w-2xl mx-auto mb-8 animate-slide-up delay-300 text-left">
          <div className="bg-white dark:bg-[#0c111c] border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:border-cobalt-500/80 focus-within:ring-1 focus-within:ring-cobalt-500/30">
            
            {/* Console Header Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cobalt-500" />
                <span>LESSON_PROMPT_INPUT</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/[0.05] border border-slate-300/60 dark:border-white/[0.08]">
                  LaTeX $E=mc^2$
                </span>
                <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">60FPS Canvas Ready</span>
              </div>
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
              className="p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex-1 flex items-center px-3 py-2">
                <span className="font-mono text-sm text-cobalt-500 dark:text-cobalt-400 mr-2 select-none">❯</span>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Quantum Bell state entanglement, or Transformer self-attention"
                  className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <span>Orchestrate Lesson</span>
                <CornerDownLeft className="w-3.5 h-3.5 opacity-70" />
              </button>
            </form>
          </div>

          {/* Quick Preset Labs (Precision chips with domain tags) */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Verified Labs:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TOPICS.map((topic, i) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleCreate(topic.prompt)}
                    className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06] hover:border-cobalt-400/40 text-slate-700 dark:text-slate-300 text-xs transition-all cursor-pointer"
                  >
                    <Icon className="w-3 h-3 text-cobalt-500 group-hover:scale-110 transition-transform" />
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                      [{topic.domain}]
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Tripartite Engineering Verification Bar (Replaces generic marketing claim) */}
        <div className="w-full max-w-2xl pt-6 border-t border-slate-200/80 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-[11px] text-slate-500 dark:text-slate-400 animate-slide-up delay-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>01 · Real-Time Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>02 · First-Principles Derivation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>03 · Socratic Challenge</span>
          </div>
        </div>

      </div>
    </section>
  );
}
