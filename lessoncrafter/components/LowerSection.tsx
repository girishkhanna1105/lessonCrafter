"use client";

import { useState } from "react";
import { 
  Sliders, 
  BookOpen, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Cpu, 
  Terminal, 
  Sparkles,
  Zap,
  Activity,
  Atom,
  BrainCircuit,
  Sigma,
  Dna
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";

const PIPELINE_SPECIFICATIONS = [
  {
    icon: Sliders,
    step: "01",
    tag: "SIMULATION RUNTIME",
    title: "Client-Side Parametric Sandboxes",
    spec: "60 FPS CLIENT VECTOR ENGINE",
    desc: "Every lesson compiles self-contained, browser-native simulation engines with zero external CDNs. Parameters update in real time with hardware-accelerated SVG and Canvas vector rendering.",
    telemetry: "RUNTIME : REACTIVE VIRTUAL DOM · JITTER : <0.2ms"
  },
  {
    icon: BookOpen,
    step: "02",
    tag: "AXIOMATIC RIGOR",
    title: "First-Principles Derivations",
    spec: "LATEX & FORMAL PROOFS",
    desc: "No superficial summaries or hand-waving shortcuts. Equations are deconstructed from axiomatic foundations, exposing every intermediate mathematical derivation and physical intuition.",
    telemetry: "MATH ENGINE : KaTeX / MathML · RIGOR : BLOOM LEVEL 5"
  },
  {
    icon: CheckCircle2,
    step: "03",
    tag: "COGNITIVE CHALLENGE",
    title: "Socratic Dialectic Inquiries",
    spec: "GEDANKENEXPERIMENT PROBES",
    desc: "A built-in dialectic tutor designed to detect student misconceptions. Rather than spoonfeeding answers, it poses counter-intuitive physical thought experiments to guide self-derived epiphanies.",
    telemetry: "DIALECTIC LOOP : ACTIVE · SPOONFEEDING : 0%"
  },
  {
    icon: FileText,
    step: "04",
    tag: "ACADEMIC EXPORT",
    title: "Publication Document Export",
    spec: "DUAL VIEW & VECTOR PDF",
    desc: "Toggle seamlessly between the interactive parameter laboratory and a publication-grade academic document view. Export high-fidelity PDFs and self-contained HTML for offline study.",
    telemetry: "OUTPUT : STANDALONE BUNDLE · PACKAGING : ZERO RUNTIME DEPENDENCIES"
  },
];

const BENCHMARK_METRICS = [
  { value: "60 FPS", label: "Simulation Frame Rate", desc: "Native vector render loop" },
  { value: "Bloom L5", label: "Pedagogical Depth", desc: "Synthesis & critical evaluation" },
  { value: "< 24ms", label: "Inference Latency", desc: "Real-time dialectic response" },
  { value: "0 CDNs", label: "Dependency Footprint", desc: "100% self-contained code" },
];

const POPULAR_QUICK_STARTS = [
  { domain: "QUANTUM", label: "Quantum Tunneling & Wavepacket Dispersion", prompt: "Quantum Computing: Superposition, Entanglement & Bell States with real-time state vector collapse" },
  { domain: "AI / ML", label: "Transformer Attention & Q/K/V Dot Products", prompt: "Transformers & Deep Learning: Multi-Head Self-Attention Mechanism, Query-Key-Value Dot Products, and Softmax Temperature" },
  { domain: "CALCULUS", label: "Multivariable Surface Optimization & Hessian", prompt: "Calculus: Multivariable Optimization, Hessian Matrices & Lagrange Multipliers" },
  { domain: "GENETICS", label: "CRISPR-Cas9 Cleavage & R-Loop Kinetics", prompt: "Cellular Genetics: CRISPR-Cas9 Molecular Mechanism, Guide RNA Targeting, and Non-Homologous End Joining" },
];

export default function LowerSection() {
  const router = useRouter();

  const handleLaunchTopic = (promptText: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", promptText);
    }
    router.push("/studio");
  };

  return (
    <section className="pt-6 sm:pt-8 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative select-none">
      
      {/* ── Section Header ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 animate-pulse" />
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">ENGINEERING ARCHITECTURE</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-cyan-500 font-bold">INSTRUMENT SPECIFICATION</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Built as an instrument.{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              Not a content feed.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            LessonCrafter combines procedural simulation engines, step-by-step mathematical proofs, and dialectic counter-tests 
            into a unified academic workspace.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Metric Telemetry Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 mb-10">
        {BENCHMARK_METRICS.map((metric, i) => (
          <ScrollReveal key={i} delay={i * 60} direction="up" threshold={0.1}>
            <div className="p-4 rounded-xl bg-white/80 dark:bg-[#0c111c]/75 border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-md shadow-sm text-center transition-all hover:border-cobalt-500/40">
              <div className="font-mono text-xl sm:text-2xl font-black text-cobalt-600 dark:text-cobalt-400 mb-0.5 tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{metric.label}</div>
              <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{metric.desc}</div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* ── 4 Architecture Engine Modules (2x2 Precision Deck) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {PIPELINE_SPECIFICATIONS.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <ScrollReveal key={i} delay={i * 80} direction="up" threshold={0.08}>
              <div className="h-full p-5 sm:p-6 rounded-2xl bg-white/80 dark:bg-[#0c111c]/75 border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl shadow-xl shadow-slate-200/30 dark:shadow-none flex flex-col justify-between transition-all hover:border-cobalt-400/50 hover:shadow-cobalt-500/5">
                
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                        STAGE {spec.step}
                      </span>
                    </div>

                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 font-bold border border-slate-200/80 dark:border-white/[0.06]">
                      {spec.tag}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                    {spec.title}
                  </h3>

                  <div className="font-mono text-[11px] text-cobalt-600 dark:text-cyan-400 font-semibold mb-2">
                    {spec.spec}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                    {spec.desc}
                  </p>
                </div>

                <div className="pt-3 mt-4 border-t border-slate-100 dark:border-white/[0.06] font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {spec.telemetry}
                </div>

              </div>
            </ScrollReveal>
          );
        })}
      </div>

      {/* ── Interactive Studio Command Terminal (Master Launch Deck) ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white/90 dark:bg-[#0c111c]/90 backdrop-blur-2xl shadow-2xl p-6 sm:p-10 relative overflow-hidden text-left">
          
          {/* Subtle Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cobalt-500 via-cyan-400 to-cobalt-500" />

          {/* Terminal Console Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200/80 dark:border-white/[0.08] font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 dark:text-slate-300 font-bold">COMPILATION STUDIO COMMAND DECK</span>
            </div>
            <div className="hidden sm:inline font-mono text-[11px] text-slate-400">
              STATUS : READY TO ORCHESTRATE
            </div>
          </div>

          <div className="max-w-2xl mb-6">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Compile your first parametric laboratory.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Enter any theorem, physical law, or algorithm. LessonCrafter compiles a full executable simulation, 
              first-principles proof, and dialectic challenge in under 30 seconds.
            </p>
          </div>

          {/* 1-Click Launch Presets */}
          <div className="space-y-2 mb-6">
            <div className="font-mono text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              Quick Orchestration Presets:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              {POPULAR_QUICK_STARTS.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLaunchTopic(topic.prompt)}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06] text-left transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-cobalt-600 dark:text-cyan-400 font-bold shrink-0">
                      [{topic.domain}]
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 truncate font-sans text-xs">
                      {topic.label}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cobalt-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Master Launch CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/studio")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xl shadow-cobalt-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Terminal className="w-4 h-4" />
              <span>Launch Studio Compiler</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => router.push("/explore")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              <span>Explore Verified Labs</span>
            </button>
          </div>

        </div>
      </ScrollReveal>

      {/* ── Technical Footer ── */}
      <div className="mt-14 pt-6 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">LessonCrafter</span>
          <span>·</span>
          <span>Parametric STEM Workbench</span>
        </div>

        <div className="flex items-center gap-4">
          <span>SYS : NOMINAL</span>
          <span>·</span>
          <span>RUNTIME : 60 FPS</span>
          <span>·</span>
          <span>2026 EDITION</span>
        </div>
      </div>

    </section>
  );
}
