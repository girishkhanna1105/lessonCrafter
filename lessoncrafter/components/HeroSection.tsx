"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Atom, 
  BrainCircuit, 
  Sigma, 
  Dna, 
  CornerDownLeft,
  CheckCircle2,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Maximize2
} from "lucide-react";

const POPULAR_TOPICS = [
  { 
    domain: "QUANTUM", 
    label: "Superposition & Bell States", 
    prompt: "Quantum Computing: Superposition, Entanglement & Bell States with real-time state vector collapse", 
    icon: Atom 
  },
  { 
    domain: "AI / ML", 
    label: "Transformer Self-Attention", 
    prompt: "Transformers: Scaled Dot-Product Self-Attention Mechanics & Q/K/V Projection Matrices", 
    icon: BrainCircuit 
  },
  { 
    domain: "CALCULUS", 
    label: "Multivariable Optimization", 
    prompt: "Calculus: Multivariable Optimization, Hessian Matrices & Lagrange Multipliers", 
    icon: Sigma 
  },
  { 
    domain: "GENETICS", 
    label: "CRISPR-Cas9 Dynamics", 
    prompt: "CRISPR-Cas9: Molecular Cleavage Mechanism, PAM Recognition & Double-Strand Repair", 
    icon: Dna 
  },
];

export default function HeroSection() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  // 3D Animated Vector Canvas Clock for Flank Instrumentation
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setTick((prev) => (prev + 1) % 7200);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleCreate = (topicText?: string) => {
    const text = topicText || prompt;
    if (text.trim()) {
      localStorage.setItem("pending_prompt", text.trim());
    }
    router.push("/studio");
  };

  // Dynamic values computed for real-time oscilloscope on Left Flank
  const wavePoints = Array.from({ length: 32 }).map((_, i) => {
    const x = (i / 31) * 220;
    const y = 35 + Math.sin((i * 0.28) + (tick * 0.05)) * 18;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" L ");

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[96vh] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* ── 1. 3D Perspective Kinetic Grid (Replaces flat static background) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        
        {/* 3D Perspective Plane */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:900px]">
          <div 
            className="w-[200vw] h-[160vh] origin-center opacity-[0.06] dark:opacity-[0.14] transition-transform duration-700"
            style={{
              transform: "rotateX(66deg) translateY(-60px) translateZ(0)",
              backgroundImage: `
                linear-gradient(to right, #3b82f6 1px, transparent 1px),
                linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {/* Ambient Spatial Lighting & Horizon Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--tw-gradient-stops))] from-transparent via-background/40 to-background" />

        {/* Subtle Horizontal Depth Scanning Beam */}
        <div 
          className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cobalt-500/40 to-transparent blur-[1px] opacity-70"
          style={{
            top: "42%",
            animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}
        />
      </div>

      {/* ── 2. Full-Width 3-Column Studio Workstation Stage ── */}
      <div className="max-w-[1440px] w-full mx-auto relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">

        {/* ════ LEFT FLANK: Real-Time Laboratory Telemetry Deck ════ */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5 text-left animate-slide-right">
          
          {/* Deck 1: Live Physics Waveform Rig */}
          <div className="bg-white/80 dark:bg-[#0c111c]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 shadow-xl shadow-slate-200/30 dark:shadow-none backdrop-blur-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.06] font-mono text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>OSCILLOSCOPE CH-1</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                60 FPS
              </span>
            </div>

            {/* Live SVG Waveform */}
            <div className="my-3 bg-slate-50 dark:bg-black/50 border border-slate-200/60 dark:border-white/[0.05] rounded-lg p-2.5 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
                  backgroundSize: "12px 12px"
                }}
              />
              <svg className="w-full h-16 overflow-visible" viewBox="0 0 220 70">
                <path
                  d={`M ${wavePoints}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="filter drop-shadow-[0_0_6px_rgba(59,130,246,0.6)]"
                />
              </svg>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
                <span>f₁: 440 Hz</span>
                <span>φ: {(tick % 360)}°</span>
                <span className="text-cobalt-500 dark:text-cobalt-400 font-bold">HARMONIC: ACTIVE</span>
              </div>
            </div>

            {/* Telemetry Numeric Badges */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>State Equation:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">|Ψ⟩ = α|0⟩ + β|1⟩</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Born Prob P(|0⟩):</span>
                <span className="text-emerald-500 font-bold">68.4%</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Hamiltonian Energy:</span>
                <span className="text-cyan-500 font-bold">1.414 ℏω</span>
              </div>
            </div>
          </div>

          {/* Deck 2: Active Simulation Parameter Rig */}
          <div className="bg-white/80 dark:bg-[#0c111c]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-3.5 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md font-mono text-[11px]">
            <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Parametric Bounds</span>
              <span className="text-cobalt-500 font-bold">S² COMPLIANT</span>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                  <span>Damping Ratio (ζ)</span>
                  <span className="font-bold">0.42</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div className="w-[42%] h-full bg-cobalt-500 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-slate-600 dark:text-slate-300 mb-1">
                  <span>Resonance Index (Q)</span>
                  <span className="font-bold">8.40</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div className="w-[74%] h-full bg-cyan-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ════ CENTER STAGE: The Command Console & Authority Headline ════ */}
        <div className="xl:col-span-6 flex flex-col items-center text-center">

          {/* 1. Precision Status Strip */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-6 animate-slide-up">
            <span className="flex items-center gap-1.5 font-semibold text-cobalt-600 dark:text-cobalt-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ENGINE: ACTIVE
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-500 dark:text-slate-400">PARAMETRIC STEM WORKBENCH</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">v2.4 KINETIC</span>
          </div>

          {/* 2. Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-5 max-w-2xl animate-slide-up delay-100">
            Don't just read about complex systems.{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              Experiment with them.
            </span>
          </h1>

          {/* 3. Subtitle */}
          <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8 animate-slide-up delay-200">
            Transform any theorem, physical law, or algorithm into an interactive 
            parameter simulation with step-by-step derivations and Socratic inquiry.
          </p>

          {/* 4. The Instrument Command Console */}
          <div className="w-full max-w-xl mx-auto mb-6 animate-slide-up delay-300 text-left">
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
                  <span className="text-emerald-600 dark:text-emerald-400 hidden sm:inline">60FPS Canvas</span>
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

            {/* Quick Preset Labs */}
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

          {/* Tripartite Verification Bar */}
          <div className="w-full max-w-xl pt-5 border-t border-slate-200/80 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-2 text-left font-mono text-[11px] text-slate-500 dark:text-slate-400 animate-slide-up delay-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>01 · Parametric Sim</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>02 · First-Principles Proof</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>03 · Socratic Trap</span>
            </div>
          </div>

        </div>

        {/* ════ RIGHT FLANK: Multi-Agent Orchestrator Pipeline Monitor ════ */}
        <div className="hidden xl:flex xl:col-span-3 flex-col gap-3.5 text-left animate-slide-left">

          {/* Deck 1: Multi-Agent Compilation Heartbeat */}
          <div className="bg-white/80 dark:bg-[#0c111c]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-4 shadow-xl shadow-slate-200/30 dark:shadow-none backdrop-blur-md font-mono text-[11px]">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>AGENT ORCHESTRATOR</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">PID: 4919</span>
            </div>

            {/* Pipeline Stage Chips */}
            <div className="my-3 space-y-2">
              <div className="p-2 rounded bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">01. Pedagogy Scaffolding</span>
                </div>
                <span className="text-[10px] text-emerald-500 font-bold">Bloom L5</span>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">02. Mathematical Derivation</span>
                </div>
                <span className="text-[10px] text-slate-400">ℂ² → S²</span>
              </div>

              <div className="p-2 rounded bg-cobalt-500/10 border border-cobalt-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-400 animate-ping" />
                  <span className="text-cobalt-600 dark:text-cobalt-300 font-semibold">03. Interactive Engine</span>
                </div>
                <span className="text-[10px] text-cobalt-500 font-bold">SVG Vector</span>
              </div>

              <div className="p-2 rounded bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">04. Socratic Misconception</span>
                </div>
                <span className="text-[10px] text-slate-500">Standby</span>
              </div>
            </div>

            {/* Inference Telemetry Velocity */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
              <span>STREAM VELOCITY:</span>
              <span className="text-cyan-400 font-bold">52 tokens/s · 24ms</span>
            </div>
          </div>

          {/* Deck 2: Pedagogical Integrity Stamp */}
          <div className="bg-white/80 dark:bg-[#0c111c]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-xl p-3.5 shadow-lg shadow-slate-200/30 dark:shadow-none backdrop-blur-md font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Cognitive Integrity</span>
              <span className="text-emerald-500 font-bold">VERIFIED</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              Every lesson compiles self-contained reactive React components with zero external CDNs.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
