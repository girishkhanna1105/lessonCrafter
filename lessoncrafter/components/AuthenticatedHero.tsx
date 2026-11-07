"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, ArrowRight, Sparkles, 
  Atom, BrainCircuit, Sigma, Dna, 
  Zap, ChevronRight, Search
} from "lucide-react";

interface AuthenticatedHeroProps {
  user: any;
}

const TOPIC_SUGGESTIONS = [
  {
    icon: <BrainCircuit className="w-5 h-5" />,
    color: "cobalt",
    label: "Transformers & Attention",
    desc: "Q/K/V projections, multi-head attention, positional encoding",
    prompt: "Transformers: Self-Attention Mechanics & Q/K/V Matrices",
  },
  {
    icon: <Atom className="w-5 h-5" />,
    color: "marine",
    label: "Quantum Entanglement",
    desc: "Bell states, superposition, wave function collapse",
    prompt: "Quantum Computing: Superposition, Entanglement & Bell States",
  },
  {
    icon: <Sigma className="w-5 h-5" />,
    color: "solar",
    label: "Calculus Optimization",
    desc: "Critical points, Hessian matrices, Lagrange multipliers",
    prompt: "Calculus: Multivariable Optimization & Lagrange Multipliers",
  },
  {
    icon: <Dna className="w-5 h-5" />,
    color: "jade",
    label: "CRISPR Gene Editing",
    desc: "Cas9 mechanism, guide RNA, gene targeting sequences",
    prompt: "CRISPR-Cas9: Gene Editing Mechanism & Applications",
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; glow: string }> = {
  cobalt: {
    bg: "hover:bg-cobalt-50/60 dark:hover:bg-cobalt-950/30",
    border: "border-cobalt-200/60 dark:border-cobalt-800/40 hover:border-cobalt-400/60 dark:hover:border-cobalt-500/40",
    text: "text-cobalt-700 dark:text-cobalt-300",
    iconBg: "bg-cobalt-100 dark:bg-cobalt-900/60 text-cobalt-600 dark:text-cobalt-400",
    glow: "group-hover:shadow-cobalt-500/20",
  },
  marine: {
    bg: "hover:bg-cyan-50/60 dark:hover:bg-cyan-950/30",
    border: "border-cyan-200/60 dark:border-cyan-800/40 hover:border-cyan-400/60 dark:hover:border-cyan-500/40",
    text: "text-cyan-700 dark:text-cyan-300",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/60 text-cyan-600 dark:text-cyan-400",
    glow: "group-hover:shadow-cyan-500/20",
  },
  solar: {
    bg: "hover:bg-amber-50/60 dark:hover:bg-amber-950/30",
    border: "border-amber-200/60 dark:border-amber-800/40 hover:border-amber-400/60 dark:hover:border-amber-500/40",
    text: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400",
    glow: "group-hover:shadow-amber-500/20",
  },
  jade: {
    bg: "hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200/60 dark:border-emerald-800/40 hover:border-emerald-400/60 dark:hover:border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400",
    glow: "group-hover:shadow-emerald-500/20",
  },
};

export default function AuthenticatedHero({ user }: AuthenticatedHeroProps) {
  const router = useRouter();
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const [inputVal, setInputVal] = useState("");

  const handleLaunch = (prompt?: string) => {
    const text = prompt || inputVal;
    if (text.trim()) localStorage.setItem("pending_prompt", text.trim());
    router.push("/studio");
  };

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-28 pb-16 px-4 overflow-hidden">

      {/* ── Background depth layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary cobalt radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cobalt-600/[0.09] dark:bg-cobalt-500/[0.13] rounded-full blur-[130px]" />
        {/* Cyan accent glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-marine-500/[0.07] dark:bg-marine-500/[0.09] rounded-full blur-[120px]" />
        {/* Fine dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="max-w-4xl w-full mx-auto relative z-10">

        {/* Greeting pill */}
        <div className="mb-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt-50 dark:bg-cobalt-950/50 border border-cobalt-200/70 dark:border-cobalt-800/60 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
          <span className="text-xs font-semibold text-cobalt-700 dark:text-cobalt-300 tracking-wide">
            Welcome back, {firstName}
          </span>
        </div>

        {/* Hero headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-5">
          What would you like to
          <br />
          <span className="relative inline-block">
            <span className="text-gradient">learn today?</span>
            {/* Underline accent */}
            <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-cobalt-500 to-marine-500 rounded-full opacity-60" />
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed mb-10 font-normal">
          Type any topic and get a fully interactive lesson with live simulations, 
          first-principles explanations, and tailored practice problems.
        </p>

        {/* ── Big search / input bar ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleLaunch(); }}
          className="relative group mb-10"
        >
          <div className="flex items-stretch bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none transition-all duration-200 focus-within:border-cobalt-400 dark:focus-within:border-cobalt-500 focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] dark:focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] overflow-hidden">
            <div className="flex items-center pl-5 text-slate-400">
              <Search className="w-5 h-5 flex-shrink-0" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. How does gradient descent work in neural networks?"
              className="flex-1 bg-transparent px-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-base focus:outline-none"
            />
            <button
              type="submit"
              className="m-2 px-6 py-3 bg-cobalt-600 hover:bg-cobalt-500 active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-cobalt-600/25 flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Build Lesson</span>
              <span className="sm:hidden">Build</span>
            </button>
          </div>
        </form>

        {/* ── Topic suggestion cards ── */}
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Or start with a popular topic
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOPIC_SUGGESTIONS.map((topic, i) => {
              const c = colorMap[topic.color];
              return (
                <button
                  key={i}
                  onClick={() => handleLaunch(topic.prompt)}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg ${c.border} ${c.bg} ${c.glow}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
                    {topic.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold ${c.text} mb-0.5 truncate`}>
                      {topic.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
                      {topic.desc}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
