"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Atom, 
  BrainCircuit, 
  Sigma, 
  Dna, 
  CornerDownLeft,
  CheckCircle2,
  Sparkles,
  Sliders,
  Play
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
    <section className="relative flex flex-col items-center justify-center pt-16 sm:pt-20 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 select-none">
      
      {/* ── Architectural Grid Accents & Laser Sweep ── */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        
        {/* Animated Horizontal Laser Horizon Beam */}
        <div 
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cobalt-400/40 to-transparent blur-[1px]"
          style={{
            top: "38%",
            animation: "pulse 5s ease-in-out infinite"
          }}
        />

        {/* Architectural Flank Rulers */}
        <div className="hidden 2xl:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 text-cobalt-500/80 font-bold">
            AXIS_Y : 0.00 → 1.00
          </span>
          <div className="w-px h-28 bg-gradient-to-b from-cobalt-500/40 via-slate-700/40 to-transparent" />
          <span>[ψ] 60FPS</span>
        </div>

        <div className="hidden 2xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] text-cyan-500/80 font-bold">
            LATENCY : 24ms
          </span>
          <div className="w-px h-28 bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-transparent" />
          <span>[TeX] READY</span>
        </div>
      </div>

      {/* ── 2. Focused, Authoritative Command Center ── */}
      <div className="max-w-4xl w-full mx-auto relative z-10 text-center flex flex-col items-center">

        {/* Precision Status Strip */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/[0.1] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-7 animate-slide-up backdrop-blur-md">
          <span className="flex items-center gap-1.5 font-semibold text-cobalt-600 dark:text-cobalt-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ENGINE: ACTIVE
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">PARAMETRIC STEM WORKBENCH</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-cyan-500 font-bold hidden sm:inline">v2.4 KINETIC</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08] mb-6 max-w-3xl animate-slide-up delay-100">
          Don't just read about complex systems.{" "}
          <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
            Experiment with them.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-10 animate-slide-up delay-200">
          Transform any theorem, physical law, or algorithm into an interactive 
          parameter simulation with step-by-step mathematical derivations and Socratic inquiry.
        </p>

        {/* The Instrument Command Console */}
        <div className="w-full max-w-2xl mx-auto mb-8 animate-slide-up delay-300 text-left">
          <div className="bg-white/95 dark:bg-[#0c111c]/95 border border-slate-200 dark:border-white/[0.12] rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-500/20 backdrop-blur-xl">
            
            {/* Console Header Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none">
              <div className="flex items-center gap-2 font-medium">
                <Terminal className="w-3.5 h-3.5 text-cobalt-500" />
                <span className="text-slate-700 dark:text-slate-300">LESSON_PROMPT_INPUT</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-white/[0.06] border border-slate-300/60 dark:border-white/[0.08] text-slate-600 dark:text-slate-300">
                  LaTeX $E=mc^2$
                </span>
                <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold hidden sm:inline">60FPS Canvas</span>
              </div>
            </div>

            {/* Prompt Input Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleCreate(); }}
              className="p-2 sm:p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex-1 flex items-center px-3 py-2.5">
                <span className="font-mono text-base text-cobalt-500 dark:text-cobalt-400 mr-2.5 select-none font-bold">❯</span>
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
                className="px-6 py-3 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-cobalt-600/25 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <span>Orchestrate Lesson</span>
                <CornerDownLeft className="w-4 h-4 opacity-75" />
              </button>
            </form>
          </div>

          {/* Quick Preset Labs */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 font-semibold">
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
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] hover:border-cobalt-400/50 text-slate-700 dark:text-slate-300 text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5 text-cobalt-500 group-hover:scale-110 transition-transform" />
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

        {/* Tripartite Engineering Verification Bar */}
        <div className="w-full max-w-2xl pt-6 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-left font-mono text-[11px] text-slate-500 dark:text-slate-400 animate-slide-up delay-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>01 · Parametric Simulation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>02 · First-Principles Proof</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>03 · Socratic Counter-Test</span>
          </div>
        </div>

      </div>
    </section>
  );
}
