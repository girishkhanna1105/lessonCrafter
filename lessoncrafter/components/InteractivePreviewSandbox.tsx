"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  RotateCcw, 
  ArrowRight, 
  Activity, 
  Globe, 
  Cpu, 
  Play, 
  Pause, 
  Terminal,
  CheckCircle2,
  Sliders
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

type SimType = "waves" | "orbit" | "neuron";

export default function InteractivePreviewSandbox() {
  const router = useRouter();
  const [activeSim, setActiveSim] = useState<SimType>("waves");
  const [isPlaying, setIsPlaying] = useState(true);
  const [tick, setTick] = useState(0);

  // Simulation A: Wave Superposition State
  const [freq1, setFreq1] = useState(2);
  const [freq2, setFreq2] = useState(3);
  const [phase, setPhase] = useState(0);
  const [amplitude, setAmplitude] = useState(28);

  // Simulation B: Orbital Mechanics State
  const [centralMass, setCentralMass] = useState(120);
  const [orbitRadius, setOrbitRadius] = useState(90);
  const [satAngle, setSatAngle] = useState(0);

  // Simulation C: Neural Activation State
  const [x1, setX1] = useState(0.8);
  const [w1, setW1] = useState(1.4);
  const [x2, setX2] = useState(-0.5);
  const [w2, setW2] = useState(0.9);
  const [bias, setBias] = useState(0.2);
  const [actFunc, setActFunc] = useState<"relu" | "sigmoid" | "tanh">("sigmoid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation clock (starts only after hydration to eliminate SSR mismatches)
  useEffect(() => {
    if (!isPlaying || !mounted) return;
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 3600);
      setSatAngle((prev) => (prev + 0.04 * (centralMass / 100)) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, mounted, centralMass]);

  // Compute wave points with deterministic precision
  const pointsCount = 60;
  const currentTick = mounted ? tick : 0;
  const wavePoints = Array.from({ length: pointsCount }).map((_, i) => {
    const x = Number(((i / (pointsCount - 1)) * 320).toFixed(2));
    const t = (currentTick * 0.05);
    const y1 = Number((45 + Math.sin((i * 0.15 * freq1) + t) * (amplitude * 0.5)).toFixed(2));
    const y2 = Number((45 + Math.sin((i * 0.15 * freq2) + t + (phase * Math.PI / 180)) * (amplitude * 0.5)).toFixed(2));
    const yTotal = Number((105 + (y1 - 45) + (y2 - 45)).toFixed(2));
    return { x, y1, y2, yTotal };
  });

  const wave1Path = `M ${wavePoints.map(p => `${p.x},${p.y1}`).join(" L ")}`;
  const wave2Path = `M ${wavePoints.map(p => `${p.x},${p.y2}`).join(" L ")}`;
  const totalWavePath = `M ${wavePoints.map(p => `${p.x},${p.yTotal}`).join(" L ")}`;

  // Compute neural activation
  const weightedSum = (x1 * w1) + (x2 * w2) + bias;
  let activationOutput = 0;
  if (actFunc === "relu") {
    activationOutput = Math.max(0, weightedSum);
  } else if (actFunc === "sigmoid") {
    activationOutput = 1 / (1 + Math.exp(-weightedSum));
  } else {
    activationOutput = Math.tanh(weightedSum);
  }

  // Handle launch in studio
  const handleLaunchTopic = (topic: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", topic);
    }
    router.push("/studio");
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative select-none">
      
      {/* ── Section Header ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-12">
          
          {/* Technical Status Strip */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">BENCHMARK // 02</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>EXPLORABLE PARAMETRIC RIGS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Never memorize an equation you can{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              simulate.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Every lesson compiles an instrument-grade simulator. Adjust the physical parameters below 
            to see wave interference, orbital gravitation, and neural activations respond in real time.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Precision Instrument Workbench Container ── */}
      <ScrollReveal direction="up" delay={120} threshold={0.08}>
        <div className="rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#0c111c] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
          
          {/* 1. Hardware-Style Channel Selector Dock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-white/[0.08] bg-slate-50/80 dark:bg-slate-900/50">
            
            {/* Channel Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveSim("waves")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSim === "waves"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>CH-01: Wave Superposition</span>
              </button>

              <button
                onClick={() => setActiveSim("orbit")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSim === "orbit"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>CH-02: Keplerian Gravity</span>
              </button>

              <button
                onClick={() => setActiveSim("neuron")}
                className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeSim === "neuron"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06]"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-solar-400" />
                <span>CH-03: Perceptron Activation</span>
              </button>
            </div>

            {/* Run / Pause / Reset Dock */}
            <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px]">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                <span>{isPlaying ? "60 FPS ACTIVE" : "PAUSED"}</span>
              </div>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.06] flex items-center gap-1 transition-colors cursor-pointer"
                title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
              >
                {isPlaying ? <Pause className="w-3 h-3 text-solar-500" /> : <Play className="w-3 h-3 text-emerald-500" />}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>

              <button
                onClick={() => {
                  setTick(0);
                  setFreq1(2);
                  setFreq2(3);
                  setPhase(0);
                  setCentralMass(120);
                  setOrbitRadius(90);
                }}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-white/[0.06] transition-colors cursor-pointer"
                title="Reset parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Workspace Body: Left Parameters vs Right Oscilloscope Canvas */}
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* ════ LEFT: Technical Parameter Docks (5 Cols) ════ */}
            <div className="lg:col-span-5 space-y-5">
              
              {activeSim === "waves" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  
                  {/* Slider 1 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Wave 1 Frequency (f₁)</span>
                      <span className="text-cobalt-600 dark:text-cobalt-400 font-bold tabular-nums">{freq1} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={freq1}
                      onChange={(e) => setFreq1(Number(e.target.value))}
                      className="w-full accent-cobalt-600 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 2 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Wave 2 Frequency (f₂)</span>
                      <span className="text-cyan-500 font-bold tabular-nums">{freq2} Hz</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      step="1"
                      value={freq2}
                      onChange={(e) => setFreq2(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Slider 3 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Phase Offset (Δφ)</span>
                      <span className="text-solar-500 font-bold tabular-nums">{phase}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={phase}
                      onChange={(e) => setPhase(Number(e.target.value))}
                      className="w-full accent-solar-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Formula Derivation Card */}
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400 uppercase text-[10px] tracking-wider mb-1">
                      <span>SUPERPOSITION THEOREM</span>
                      <span className="text-cobalt-500 font-bold">LINEAR SYSTEM</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold">
                      y(t) = A·sin(2π·{freq1}t) + A·sin(2π·{freq2}t + {phase}°)
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed pt-1">
                      At Δφ = 0°, waves experience constructive doubling. At Δφ = 180° with matched frequencies, complete destructive cancellation occurs.
                    </p>
                  </div>
                </div>
              )}

              {activeSim === "orbit" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Central Star Mass (M)</span>
                      <span className="text-solar-500 font-bold tabular-nums">{centralMass} M☉</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      step="10"
                      value={centralMass}
                      onChange={(e) => setCentralMass(Number(e.target.value))}
                      className="w-full accent-solar-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Orbital Radius (r)</span>
                      <span className="text-cyan-500 font-bold tabular-nums">{orbitRadius} AU</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="140"
                      step="5"
                      value={orbitRadius}
                      onChange={(e) => setOrbitRadius(Number(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Orbital Velocity (v = √(GM/r)):</span>
                      <span className="text-emerald-500 font-bold tabular-nums">{(Math.sqrt((centralMass * 10) / orbitRadius)).toFixed(2)} km/s</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Keplerian Period (T):</span>
                      <span className="text-cobalt-400 font-bold tabular-nums">{(2 * Math.PI * Math.sqrt(Math.pow(orbitRadius, 3) / (centralMass * 100))).toFixed(1)} yr</span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px] text-slate-400 font-sans">
                      Kepler's 3rd Law: T² ∝ r³. Higher central mass deepens the gravity well.
                    </div>
                  </div>
                </div>
              )}

              {activeSim === "neuron" && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                        <span className="text-slate-500">Input (x₁)</span>
                        <span className="text-cobalt-500 tabular-nums">{x1.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={x1}
                        onChange={(e) => setX1(Number(e.target.value))}
                        className="w-full accent-cobalt-600 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                        <span className="text-slate-500">Weight (w₁)</span>
                        <span className="text-cobalt-500 tabular-nums">{w1.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={w1}
                        onChange={(e) => setW1(Number(e.target.value))}
                        className="w-full accent-cobalt-600 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                        <span className="text-slate-500">Input (x₂)</span>
                        <span className="text-cyan-500 tabular-nums">{x2.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={x2}
                        onChange={(e) => setX2(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                        <span className="text-slate-500">Weight (w₂)</span>
                        <span className="text-cyan-500 tabular-nums">{w2.toFixed(1)}</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.1"
                        value={w2}
                        onChange={(e) => setW2(Number(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                      <span className="text-slate-500">Neuron Bias (b)</span>
                      <span className="text-solar-500 tabular-nums">{bias.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.1"
                      value={bias}
                      onChange={(e) => setBias(Number(e.target.value))}
                      className="w-full accent-solar-500 h-1.5 bg-slate-200 dark:bg-white/[0.08] rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold text-slate-500 block mb-1.5">Activation Function (σ)</span>
                    <div className="flex gap-2">
                      {(["sigmoid", "relu", "tanh"] as const).map((fn) => (
                        <button
                          key={fn}
                          type="button"
                          onClick={() => setActFunc(fn)}
                          className={`flex-1 py-1 rounded-md text-xs font-mono font-bold uppercase transition-all ${
                            actFunc === fn
                              ? "bg-cobalt-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.06]"
                          }`}
                        >
                          {fn}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button: Compile in Studio */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    if (activeSim === "waves") {
                      handleLaunchTopic("Wave Mechanics, Frequency & Wave Superposition with interactive audio-visual interference");
                    } else if (activeSim === "orbit") {
                      handleLaunchTopic("Astrophysics: Keplerian Orbital Mechanics, Gravitational Pull and Planetary Velocity");
                    } else {
                      handleLaunchTopic("Neural Networks: Perceptrons, Synaptic Weights, Bias, and Non-Linear Activation Functions");
                    }
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-semibold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Architect Full Laboratory in Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* ════ RIGHT: Oscilloscope Monitor Canvas (7 Cols) ════ */}
            <div className="lg:col-span-7 bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[360px] relative overflow-hidden">
              
              {/* Technical Reticle Background */}
              <div 
                className="absolute inset-0 opacity-[0.15] pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #334155 1px, transparent 1px),
                    linear-gradient(to bottom, #334155 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px"
                }}
              />

              {/* Reticle Crosshairs */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-800/80 pointer-events-none" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800/80 pointer-events-none" />

              {/* Top Canvas Telemetry Header */}
              <div className="relative z-10 flex justify-between items-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/90">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold text-slate-200">OSCILLOSCOPE CH-01</span>
                </span>
                <span className="text-[10px] text-slate-500 font-bold">TIME-BASE: 10ms/DIV</span>
              </div>

              {/* Simulation Canvas Display */}
              <div className="relative z-10 flex-1 flex items-center justify-center py-4">
                
                {activeSim === "waves" && (
                  <div className="w-full space-y-4">
                    <svg viewBox="0 0 320 180" className="w-full h-auto overflow-visible" suppressHydrationWarning>
                      {/* Wave 1: Cobalt */}
                      <path d={mounted ? wave1Path : ""} fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeOpacity="0.8" />
                      
                      {/* Wave 2: Cyan */}
                      <path d={mounted ? wave2Path : ""} fill="none" stroke="#06b6d4" strokeWidth="1.8" strokeOpacity="0.8" />

                      {/* Combined Superposition Wave: Glowing Trace */}
                      <path d={mounted ? totalWavePath : ""} fill="none" stroke="#38bdf8" strokeWidth="3" filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))" />
                    </svg>

                    <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#3b82f6] rounded-full inline-block" /> Wave 1</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#06b6d4] rounded-full inline-block" /> Wave 2</span>
                      <span className="flex items-center gap-1.5 font-bold text-sky-400"><span className="w-2.5 h-1.5 bg-[#38bdf8] rounded-full inline-block" /> Superposition</span>
                    </div>
                  </div>
                )}

                {activeSim === "orbit" && (
                  <div className="w-full flex items-center justify-center">
                    <svg viewBox="0 0 340 240" className="w-full max-w-sm h-auto overflow-visible" suppressHydrationWarning>
                      {/* Orbital Track */}
                      <ellipse 
                        cx="170" 
                        cy="120" 
                        rx={orbitRadius * 1.1} 
                        ry={orbitRadius * 0.75} 
                        fill="none" 
                        stroke="#334155" 
                        strokeDasharray="4 4" 
                        strokeWidth="1.2" 
                      />

                      {/* Central Star */}
                      <circle cx="170" cy="120" r={16 + (centralMass / 25)} fill="url(#starGrad)" />
                      <defs>
                        <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" />
                          <stop offset="70%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#b45309" />
                        </radialGradient>
                      </defs>

                      {/* Orbiting Satellite */}
                      {(() => {
                        const angle = mounted ? satAngle : 0;
                        const satX = (170 + Math.cos(angle) * (orbitRadius * 1.1)).toFixed(2);
                        const satY = (120 + Math.sin(angle) * (orbitRadius * 0.75)).toFixed(2);
                        return mounted ? (
                          <g>
                            <circle cx={satX} cy={satY} r="6" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                            <circle cx={satX} cy={satY} r="12" fill="none" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
                          </g>
                        ) : null;
                      })()}
                    </svg>
                  </div>
                )}

                {activeSim === "neuron" && (
                  <div className="w-full max-w-sm flex flex-col items-center">
                    <div className="flex items-center justify-between w-full mb-4">
                      
                      {/* Inputs Column */}
                      <div className="space-y-4">
                        <div className="px-3 py-1.5 rounded-lg bg-cobalt-950/80 border border-cobalt-600/40 text-center font-mono text-xs">
                          <div className="text-[10px] text-slate-400">x₁: {x1.toFixed(1)}</div>
                          <div className="text-cobalt-400 font-bold">w₁: {w1.toFixed(1)}</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-600/40 text-center font-mono text-xs">
                          <div className="text-[10px] text-slate-400">x₂: {x2.toFixed(1)}</div>
                          <div className="text-cyan-400 font-bold">w₂: {w2.toFixed(1)}</div>
                        </div>
                      </div>

                      {/* Central Summation Neuron */}
                      <div className="relative">
                        <div className="w-18 h-18 rounded-full bg-slate-900 border-2 border-cobalt-500 text-white flex flex-col items-center justify-center font-mono shadow-[0_0_16px_rgba(59,130,246,0.35)]">
                          <span className="text-[10px] text-slate-400">Σ + b</span>
                          <span className="text-sm font-bold text-cyan-400 tabular-nums">{weightedSum.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Output Value */}
                      <div className="text-center font-mono">
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{actFunc}(z)</div>
                        <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-black text-base tabular-nums">
                          {activationOutput.toFixed(2)}
                        </div>
                      </div>

                    </div>

                    {/* Activation Output Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-800 overflow-hidden relative mt-2">
                      <div 
                        className="h-full bg-gradient-to-r from-cobalt-500 via-cyan-400 to-emerald-400 transition-all duration-150"
                        style={{ width: `${Math.min(Math.max(activationOutput * 100, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Telemetry Bar */}
              <div className="relative z-10 pt-2 border-t border-slate-800/90 flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>DETERMINISTIC SIMULATION ENGINE</span>
                </span>
                <span className="text-slate-500">60 FPS · REACT DOM</span>
              </div>

            </div>

          </div>

        </div>
      </ScrollReveal>

    </section>
  );
}
