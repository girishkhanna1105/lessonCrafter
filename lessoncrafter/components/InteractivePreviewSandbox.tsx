"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Activity, 
  Globe, 
  Cpu, 
  Play, 
  Pause, 
  Zap 
} from "lucide-react";

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

  // Animation clock
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1) % 3600);
      setSatAngle((prev) => (prev + 0.04 * (centralMass / 100)) % (Math.PI * 2));
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying, centralMass]);

  // Compute wave points
  const pointsCount = 60;
  const wavePoints = Array.from({ length: pointsCount }).map((_, i) => {
    const x = (i / (pointsCount - 1)) * 320;
    const t = (tick * 0.05);
    const y1 = Math.sin((i * 0.15 * freq1) + t) * (amplitude * 0.5);
    const y2 = Math.sin((i * 0.15 * freq2) + t + (phase * Math.PI / 180)) * (amplitude * 0.5);
    const yTotal = y1 + y2;
    return { x, y1: 45 + y1, y2: 45 + y2, yTotal: 105 + yTotal };
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
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto relative">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
          <Activity className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-cobalt-700 dark:text-cobalt-300 uppercase tracking-widest">
            Zero-Latency Interactive Sandboxes
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Experience Live Synthesized Simulations
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          LessonCrafter doesn&apos;t just generate text. Every lesson compiles a live stateful visualizer that learners can manipulate in real-time. Test drive three sample modules below:
        </p>
      </div>

      {/* Simulator Card Container */}
      <div className="glass-card rounded-3xl border-slate-200 dark:border-white/10 p-5 sm:p-8 shadow-2xl bg-card text-card-foreground relative overflow-hidden">
        
        {/* Module Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-white/10">
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSim("waves")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeSim === "waves"
                  ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/30 ring-2 ring-cobalt-400/30"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Wave Superposition</span>
            </button>

            <button
              onClick={() => setActiveSim("orbit")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeSim === "orbit"
                  ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/30 ring-2 ring-cobalt-400/30"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Orbital Gravity Well</span>
            </button>

            <button
              onClick={() => setActiveSim("neuron")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer ${
                activeSim === "neuron"
                  ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/30 ring-2 ring-cobalt-400/30"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Neural Synapse Activation</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-solar-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
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
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
              title="Reset parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Split: Controls (Left) vs Visualizer Canvas (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* LEFT: Parameter Control Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {activeSim === "waves" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Wave 1 Frequency (f₁)</span>
                    <span className="text-cobalt-600 dark:text-cobalt-400">{freq1} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={freq1}
                    onChange={(e) => setFreq1(Number(e.target.value))}
                    className="w-full accent-cobalt-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Wave 2 Frequency (f₂)</span>
                    <span className="text-marine-600 dark:text-marine-400">{freq2} Hz</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="1"
                    value={freq2}
                    onChange={(e) => setFreq2(Number(e.target.value))}
                    className="w-full accent-marine-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Phase Offset (Δφ)</span>
                    <span className="text-solar-500">{phase}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={phase}
                    onChange={(e) => setPhase(Number(e.target.value))}
                    className="w-full accent-solar-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Wave Amplitude</span>
                    <span className="text-slate-800 dark:text-white">{amplitude} px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="45"
                    step="5"
                    value={amplitude}
                    onChange={(e) => setAmplitude(Number(e.target.value))}
                    className="w-full accent-cobalt-600 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
                    Physics Principle:
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    When frequencies match and phase is 0°, waves experience constructive interference, doubling total amplitude. At 180°, they cancel out.
                  </p>
                </div>
              </div>
            )}

            {activeSim === "orbit" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Central Star Mass (M)</span>
                    <span className="text-solar-500">{centralMass} M☉</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="10"
                    value={centralMass}
                    onChange={(e) => setCentralMass(Number(e.target.value))}
                    className="w-full accent-solar-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Orbital Semi-Major Axis (r)</span>
                    <span className="text-marine-600 dark:text-marine-400">{orbitRadius} AU</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="140"
                    step="5"
                    value={orbitRadius}
                    onChange={(e) => setOrbitRadius(Number(e.target.value))}
                    className="w-full accent-marine-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs font-mono">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Orbital Velocity (v = √(GM/r)):</span>
                    <span className="text-emerald-500 font-bold">{(Math.sqrt((centralMass * 10) / orbitRadius)).toFixed(2)} km/s</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Keplerian Period (T):</span>
                    <span className="text-cobalt-400 font-bold">{(2 * Math.PI * Math.sqrt(Math.pow(orbitRadius, 3) / (centralMass * 100))).toFixed(1)} yr</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-xs leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cobalt-500" />
                    Kepler&apos;s 3rd Law:
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    The square of the orbital period is proportional to the cube of the semi-major axis: T² ∝ r³. Higher central mass increases required orbital velocity.
                  </p>
                </div>
              </div>
            )}

            {activeSim === "neuron" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                      <span className="text-slate-500">Input 1 (x₁)</span>
                      <span className="text-cobalt-500">{x1.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={x1}
                      onChange={(e) => setX1(Number(e.target.value))}
                      className="w-full accent-cobalt-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                      <span className="text-slate-500">Weight 1 (w₁)</span>
                      <span className="text-cobalt-500">{w1.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={w1}
                      onChange={(e) => setW1(Number(e.target.value))}
                      className="w-full accent-cobalt-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                      <span className="text-slate-500">Input 2 (x₂)</span>
                      <span className="text-marine-500">{x2.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={x2}
                      onChange={(e) => setX2(Number(e.target.value))}
                      className="w-full accent-marine-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                      <span className="text-slate-500">Weight 2 (w₂)</span>
                      <span className="text-marine-500">{w2.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="0.1"
                      value={w2}
                      onChange={(e) => setW2(Number(e.target.value))}
                      className="w-full accent-marine-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono font-bold mb-1">
                    <span className="text-slate-500">Neuron Bias (b)</span>
                    <span className="text-solar-500">{bias.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.1"
                    value={bias}
                    onChange={(e) => setBias(Number(e.target.value))}
                    className="w-full accent-solar-500"
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
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                          actFunc === fn
                            ? "bg-cobalt-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {fn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Launch CTA */}
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
                className="w-full py-3.5 px-4 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cobalt-600/25 flex items-center justify-center gap-2 transition-all active:scale-95 group cursor-pointer"
              >
                <span>Synthesize Full Lesson with this Module</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* RIGHT: Live Visualizer Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-inner flex flex-col justify-between min-h-[360px] relative overflow-hidden">
            
            {/* Top Canvas Header */}
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-4 pb-2 border-b border-slate-800/80">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE REACTIVE STATE</span>
              </span>
              <span className="text-[10px] text-slate-500">60 FPS Render Loop</span>
            </div>

            {/* Simulation Canvas Display */}
            <div className="flex-1 flex items-center justify-center py-2">
              
              {activeSim === "waves" && (
                <div className="w-full space-y-4">
                  <svg viewBox="0 0 320 180" className="w-full h-auto overflow-visible">
                    {/* Gridlines */}
                    <line x1="0" y1="45" x2="320" y2="45" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />
                    <line x1="0" y1="105" x2="320" y2="105" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.8" />

                    {/* Wave 1: Cobalt */}
                    <path d={wave1Path} fill="none" stroke="#2563eb" strokeWidth="2" strokeOpacity="0.85" />
                    
                    {/* Wave 2: Cyan */}
                    <path d={wave2Path} fill="none" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.85" />

                    {/* Combined Superposition Wave: Thick Gradient-like */}
                    <path d={totalWavePath} fill="none" stroke="#38bdf8" strokeWidth="3.5" filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.4))" />
                  </svg>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#2563eb] rounded-full inline-block" /> Wave 1</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#06b6d4] rounded-full inline-block" /> Wave 2</span>
                    <span className="flex items-center gap-1.5 font-bold text-sky-400"><span className="w-2.5 h-1.5 bg-[#38bdf8] rounded-full inline-block shadow-sm" /> Superposition (Total)</span>
                  </div>
                </div>
              )}

              {activeSim === "orbit" && (
                <div className="w-full flex items-center justify-center">
                  <svg viewBox="0 0 340 240" className="w-full max-w-sm h-auto overflow-visible">
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
                      const satX = 170 + Math.cos(satAngle) * (orbitRadius * 1.1);
                      const satY = 120 + Math.sin(satAngle) * (orbitRadius * 0.75);
                      return (
                        <g>
                          <circle cx={satX} cy={satY} r="7" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                          <circle cx={satX} cy={satY} r="12" fill="none" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              )}

              {activeSim === "neuron" && (
                <div className="w-full max-w-sm flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-4">
                    
                    {/* Inputs Column */}
                    <div className="space-y-6">
                      <div className="px-3 py-1.5 rounded-xl bg-cobalt-950/80 border border-cobalt-600/40 text-center font-mono text-xs">
                        <div className="text-[10px] text-slate-400">x₁: {x1.toFixed(1)}</div>
                        <div className="text-cobalt-400 font-bold">w₁: {w1.toFixed(1)}</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-600/40 text-center font-mono text-xs">
                        <div className="text-[10px] text-slate-400">x₂: {x2.toFixed(1)}</div>
                        <div className="text-cyan-400 font-bold">w₂: {w2.toFixed(1)}</div>
                      </div>
                    </div>

                    {/* Central Summation Neuron */}
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cobalt-600 to-marine-600 text-white flex flex-col items-center justify-center font-mono shadow-lg shadow-cobalt-600/30 ring-4 ring-cobalt-400/20">
                        <span className="text-[10px] text-slate-200">Σ + b</span>
                        <span className="text-sm font-black">{weightedSum.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Output Value */}
                    <div className="text-center font-mono">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{actFunc}(z)</div>
                      <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-black text-lg">
                        {activationOutput.toFixed(2)}
                      </div>
                    </div>

                  </div>

                  {/* Activation Output Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-3 border border-slate-800 overflow-hidden relative mt-2">
                    <div 
                      className="h-full bg-gradient-to-r from-cobalt-500 via-marine-400 to-emerald-400 transition-all duration-150"
                      style={{ width: `${Math.min(Math.max(activationOutput * 100, 0), 100)}%` }}
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Status Banner */}
            <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cobalt-400">
                <Zap className="w-3.5 h-3.5" />
                <span>100% Client-Side React Runtime</span>
              </span>
              <span className="text-slate-500">React Hooks + SVG</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
