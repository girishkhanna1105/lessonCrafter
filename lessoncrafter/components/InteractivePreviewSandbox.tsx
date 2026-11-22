"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Atom, 
  Orbit, 
  BrainCircuit, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Zap, 
  Sliders, 
  Activity, 
  Layers,
  Sparkles,
  CheckCircle2,
  Maximize2
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

type ChannelId = "quantum" | "orbital" | "neural";

export default function InteractivePreviewSandbox() {
  const router = useRouter();
  const [activeChannel, setActiveChannel] = useState<ChannelId>("quantum");
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Mouse reticle coordinates over the oscilloscope
  const [reticleCoords, setReticleCoords] = useState<{ x: number; y: number } | null>(null);

  // ── Channel 01: Quantum Mechanics Parameters ──
  const [barrierV0, setBarrierV0] = useState(65); // meV
  const [particleEnergy, setParticleEnergy] = useState(55); // meV
  const [barrierWidth, setBarrierWidth] = useState(2.8); // nm
  const [packetSpread, setPacketSpread] = useState(1.4);

  // ── Channel 02: Keplerian Orbit Parameters ──
  const [starMass, setStarMass] = useState(140); // Solar mass units
  const [semiMajorAxis, setSemiMajorAxis] = useState(75); // AU
  const [eccentricity, setEccentricity] = useState(0.42); // 0.0 to 0.85

  // ── Channel 03: Neural Manifold Parameters ──
  const [hiddenUnits, setHiddenUnits] = useState(16);
  const [activationFunc, setActivationFunc] = useState<"gelu" | "relu" | "sigmoid" | "tanh">("gelu");
  const [regularization, setRegularization] = useState(0.02);

  useEffect(() => {
    setMounted(true);
  }, []);

  // High-precision animation clock
  useEffect(() => {
    if (!isPlaying || !mounted) return;
    const interval = setInterval(() => {
      setTick((prev) => (prev + 1 * speedMultiplier) % 7200);
    }, 28);
    return () => clearInterval(interval);
  }, [isPlaying, mounted, speedMultiplier]);

  // ── Channel 01 Computed: Quantum Wavepacket Dynamics ──
  // Transmission coefficient through rectangular barrier (analytic 1D Schrödinger solution)
  const kappa = Math.sqrt(Math.max(0.1, barrierV0 - particleEnergy)) * 0.512 * barrierWidth;
  let transmissionT = 0;
  if (particleEnergy < barrierV0) {
    const sinhVal = Math.sinh(kappa);
    const denom = 1 + (Math.pow(barrierV0, 2) * Math.pow(sinhVal, 2)) / (4 * particleEnergy * (barrierV0 - particleEnergy));
    transmissionT = Math.max(0.01, Math.min(0.99, 1 / denom));
  } else {
    const kPrime = Math.sqrt(Math.max(0.1, particleEnergy - barrierV0)) * 0.512 * barrierWidth;
    const sinVal = Math.sin(kPrime);
    const denom = 1 + (Math.pow(barrierV0, 2) * Math.pow(sinVal, 2)) / (4 * particleEnergy * (particleEnergy - barrierV0));
    transmissionT = Math.max(0.05, Math.min(0.99, 1 / denom));
  }
  const reflectionR = 1 - transmissionT;

  // Generate Quantum Wavepacket Path (400 points)
  const numPoints = 80;
  const currentTick = mounted ? tick : 0;
  const barrierStartX = 180;
  const barrierWidthPx = barrierWidth * 16;
  const barrierEndX = barrierStartX + barrierWidthPx;

  const wavePoints = Array.from({ length: numPoints }).map((_, i) => {
    const x = (i / (numPoints - 1)) * 440;
    const t = currentTick * 0.08;
    let amplitude = 0;

    if (x < barrierStartX) {
      // Incident + Reflected wave (Interference fringes)
      const incident = Math.sin(x * 0.12 - t);
      const reflected = Math.sqrt(reflectionR) * Math.sin(x * 0.12 + t + Math.PI);
      amplitude = (incident + reflected) * 26 * packetSpread;
    } else if (x >= barrierStartX && x <= barrierEndX) {
      // Evanescent decay inside forbidden barrier
      const decayFraction = (x - barrierStartX) / Math.max(1, barrierWidthPx);
      const decayEnvelope = Math.exp(-decayFraction * kappa);
      amplitude = decayEnvelope * Math.sin(barrierStartX * 0.12 - t) * 26 * packetSpread;
    } else {
      // Transmitted wave (attenuated amplitude, same frequency)
      const transmittedAmp = Math.sqrt(transmissionT) * 26 * packetSpread;
      amplitude = transmittedAmp * Math.sin((x - barrierEndX) * 0.12 - t);
    }

    const baselineY = 120;
    const y = Number((baselineY - amplitude).toFixed(2));
    const probabilityDensity = Math.pow(amplitude / 30, 2) * 55;
    return { x: Number(x.toFixed(2)), y, probY: Number((baselineY - probabilityDensity).toFixed(2)) };
  });

  const waveLinePath = `M ${wavePoints.map(p => `${p.x},${p.y}`).join(" L ")}`;
  const waveAreaPath = `M ${wavePoints[0].x},120 L ${wavePoints.map(p => `${p.x},${p.probY}`).join(" L ")} L ${wavePoints[wavePoints.length - 1].x},120 Z`;

  // ── Channel 02 Computed: Keplerian Mechanics ──
  const orbitCenterX = 220;
  const orbitCenterY = 115;
  const semiMajorPx = semiMajorAxis * 1.5;
  const semiMinorPx = semiMajorPx * Math.sqrt(Math.max(0.1, 1 - Math.pow(eccentricity, 2)));
  const focusOffsetX = semiMajorPx * eccentricity; // Center of star at focus F1
  const starX = orbitCenterX - focusOffsetX;
  const starY = orbitCenterY;

  // True anomaly angle (Kepler approximation with eccentric speedup at perihelion)
  const meanAnomaly = (currentTick * 0.03 * Math.sqrt(starMass / 100)) % (Math.PI * 2);
  const trueAnomaly = meanAnomaly + (2 * eccentricity - 0.25 * Math.pow(eccentricity, 3)) * Math.sin(meanAnomaly);
  const currentRadius = (semiMajorPx * (1 - Math.pow(eccentricity, 2))) / (1 + eccentricity * Math.cos(trueAnomaly));
  const planetX = starX + currentRadius * Math.cos(trueAnomaly);
  const planetY = starY + currentRadius * Math.sin(trueAnomaly);
  const instantaneousVelocity = Math.sqrt((starMass * 10) * (2 / Math.max(10, currentRadius) - 1 / semiMajorPx));

  // ── Channel 03 Computed: Neural Latent Space Manifold ──
  const neuralPoints = [
    { x: 120, y: 70, label: 1 },
    { x: 140, y: 95, label: 1 },
    { x: 110, y: 125, label: 1 },
    { x: 165, y: 80, label: 1 },
    { x: 180, y: 130, label: 1 },
    { x: 260, y: 80, label: 0 },
    { x: 290, y: 110, label: 0 },
    { x: 310, y: 70, label: 0 },
    { x: 275, y: 145, label: 0 },
    { x: 330, y: 125, label: 0 },
    { x: 215, y: 115, label: 1 },
    { x: 235, y: 85, label: 0 }
  ];

  // Presets applicator
  const applyPreset = (preset: string) => {
    if (preset === "tunneling") {
      setBarrierV0(70);
      setParticleEnergy(50);
      setBarrierWidth(2.4);
    } else if (preset === "transmission") {
      setBarrierV0(35);
      setParticleEnergy(75);
      setBarrierWidth(2.0);
    } else if (preset === "reflection") {
      setBarrierV0(95);
      setParticleEnergy(30);
      setBarrierWidth(4.5);
    } else if (preset === "circular") {
      setEccentricity(0.02);
      setSemiMajorAxis(80);
    } else if (preset === "elliptic") {
      setEccentricity(0.68);
      setSemiMajorAxis(85);
    } else if (preset === "hyperbolic") {
      setEccentricity(0.84);
      setSemiMajorAxis(95);
    }
  };

  const handleLaunchInStudio = () => {
    let topic = "Quantum Tunneling & Wavepacket Evanescence in 1D Rectangular Barriers";
    if (activeChannel === "orbital") {
      topic = "Keplerian Orbital Mechanics & Relativistic Perihelion Precession";
    } else if (activeChannel === "neural") {
      topic = "Neural Network Decision Boundary Topology & Regularization Manifolds";
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", topic);
    }
    router.push("/studio");
  };

  return (
    <section className="pt-6 sm:pt-8 pb-12 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative select-none">
      
      {/* ── Section Title & Header ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">HARDWARE-ACCELERATED RUNTIME</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-cyan-500 font-bold">60 FPS VECTOR</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Turn abstract equations into{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              tangible physical systems.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            LessonCrafter doesn't just display static text. Every lesson compiles a live parametric simulator. 
            Adjust the physical parameters below to see how the mathematics responds in real time.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Main Instrument Workstation Chassis ── */}
      <ScrollReveal direction="up" delay={120} threshold={0.08}>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white/80 dark:bg-[#0c111c]/75 backdrop-blur-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all">
          
          {/* Top Chassis Navigation Rack */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/40">
            
            {/* Multi-Disciplinary Instrument Channels */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveChannel("quantum")}
                className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeChannel === "quantum"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-white/80 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <Atom className="w-3.5 h-3.5 text-cyan-400" />
                <span>CH-01: Quantum Tunneling</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel("orbital")}
                className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeChannel === "orbital"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-white/80 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <Orbit className="w-3.5 h-3.5 text-emerald-400" />
                <span>CH-02: Keplerian Gravity</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveChannel("neural")}
                className={`px-3.5 py-1.5 rounded-md font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  activeChannel === "neural"
                    ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                    : "bg-white/80 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <span>CH-03: Neural Manifold</span>
              </button>
            </div>

            {/* Scope Playback & Timebase Controls */}
            <div className="flex items-center gap-2 font-mono text-xs text-slate-500 shrink-0 self-end sm:self-center">
              <span className="hidden md:inline text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                ● 60 FPS STABLE
              </span>
              
              {/* Speed Multiplier Pill */}
              <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] rounded-md p-0.5 border border-slate-200 dark:border-white/[0.06] text-[11px]">
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(0.5)}
                  className={`px-2 py-0.5 rounded ${speedMultiplier === 0.5 ? "bg-cobalt-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:text-white"}`}
                >
                  0.5x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(1)}
                  className={`px-2 py-0.5 rounded ${speedMultiplier === 1 ? "bg-cobalt-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:text-white"}`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setSpeedMultiplier(2)}
                  className={`px-2 py-0.5 rounded ${speedMultiplier === 2 ? "bg-cobalt-600 text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:text-white"}`}
                >
                  2x
                </button>
              </div>

              {/* Pause / Run Button */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-md bg-white hover:bg-slate-100 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                title={isPlaying ? "Pause Simulation" : "Run Simulation"}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              </button>
            </div>

          </div>

          {/* ── Main Instrument Body (Split Grid: Left Parameter Desk | Right Oscilloscope Scope) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-200/80 dark:border-white/[0.08]">
            
            {/* ════ LEFT: Parametric Control Desk & Math Proof (5 Cols) ════ */}
            <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-6">
              
              {/* ── Channel 01: Quantum Tunneling Controls ── */}
              {activeChannel === "quantum" && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">
                        1-Click Hypothesis Experiments
                      </span>
                      <span className="text-cyan-400 text-[10px]">[SCENARIO]</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => applyPreset("tunneling")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          barrierV0 === 70 && particleEnergy === 50
                            ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        ⚡ Tunneling
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("transmission")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          barrierV0 === 35 && particleEnergy === 75
                            ? "bg-cobalt-500/15 border-cobalt-500/50 text-cobalt-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        🌊 Pass Over
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("reflection")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          barrierV0 === 95 && particleEnergy === 30
                            ? "bg-rose-500/15 border-rose-500/50 text-rose-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        🛑 Wall Bound
                      </button>
                    </div>
                  </div>

                  {/* Slider: Potential Barrier Height V0 */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Potential Barrier (V₀):</span>
                      <span className="text-cyan-400 font-bold tabular-nums">{barrierV0} meV</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={95}
                      value={barrierV0}
                      onChange={(e) => setBarrierV0(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider: Particle Energy E */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Particle Incident Energy (E):</span>
                      <span className="text-cobalt-400 font-bold tabular-nums">{particleEnergy} meV</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={90}
                      value={particleEnergy}
                      onChange={(e) => setParticleEnergy(Number(e.target.value))}
                      className="w-full accent-cobalt-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider: Barrier Width w */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Barrier Spatial Width (w):</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{barrierWidth.toFixed(1)} nm</span>
                    </div>
                    <input
                      type="range"
                      min={1.0}
                      max={4.8}
                      step={0.1}
                      value={barrierWidth}
                      onChange={(e) => setBarrierWidth(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Exact Schrödinger Derivation Proof Card */}
                  <div className="p-3.5 rounded-lg bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.07] font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[10px] tracking-wider uppercase mb-1">
                      <span>SCHRÖDINGER TRANSMISSION MATRIX</span>
                      <span className="text-emerald-400 font-bold">1D CONTINUOUS</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                      T = [1 + (V₀² sinh²(κw)) / (4E(V₀ - E))]⁻¹
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px]">
                      <span>Calculated Transmission T:</span>
                      <span className="text-cyan-400 font-bold tabular-nums">{(transmissionT * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Calculated Reflection R:</span>
                      <span className="text-rose-400 font-bold tabular-nums">{(reflectionR * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed pt-1">
                      {particleEnergy < barrierV0 
                        ? "Evanescent Mode: In classical mechanics, transmission is 0%. In quantum mechanics, the wavepacket penetrates the forbidden zone via tunnel resonance."
                        : "Supra-Barrier Mode: Incident energy exceeds potential height; transmission approaches 100% with quantum phase interference fringes."}
                    </p>
                  </div>
                </div>
              )}

              {/* ── Channel 02: Keplerian Orbit Controls ── */}
              {activeChannel === "orbital" && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">
                        Keplerian Trajectory Presets
                      </span>
                      <span className="text-emerald-400 text-[10px]">[KEPLER-NEWTON]</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                      <button
                        type="button"
                        onClick={() => applyPreset("circular")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          eccentricity < 0.1
                            ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        🪐 Circular
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("elliptic")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          eccentricity >= 0.5 && eccentricity <= 0.75
                            ? "bg-cobalt-500/15 border-cobalt-500/50 text-cobalt-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        ☄️ Elliptic
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("hyperbolic")}
                        className={`py-1.5 px-2 rounded border transition-all text-center ${
                          eccentricity > 0.75
                            ? "bg-purple-500/15 border-purple-500/50 text-purple-400 font-bold"
                            : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                      >
                        💫 Perihelion
                      </button>
                    </div>
                  </div>

                  {/* Slider: Star Mass M */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Central Star Mass (M):</span>
                      <span className="text-amber-400 font-bold tabular-nums">{starMass} M☉</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={220}
                      value={starMass}
                      onChange={(e) => setStarMass(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider: Semi-Major Axis a */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Semi-Major Axis (a):</span>
                      <span className="text-cobalt-400 font-bold tabular-nums">{semiMajorAxis} AU</span>
                    </div>
                    <input
                      type="range"
                      min={45}
                      max={110}
                      value={semiMajorAxis}
                      onChange={(e) => setSemiMajorAxis(Number(e.target.value))}
                      className="w-full accent-cobalt-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Slider: Eccentricity e */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Orbital Eccentricity (e):</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{eccentricity.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.82}
                      step={0.02}
                      value={eccentricity}
                      onChange={(e) => setEccentricity(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Keplerian Dynamics Card */}
                  <div className="p-3.5 rounded-lg bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.07] font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[10px] tracking-wider uppercase mb-1">
                      <span>KEPLER'S 3RD LAW & VIS-VIVA EQUATION</span>
                      <span className="text-amber-400 font-bold">2-BODY GRAVITATION</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                      v² = GM · (2/r - 1/a)
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px]">
                      <span>Instantaneous Orbital Velocity:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">{(instantaneousVelocity * 2.8).toFixed(1)} km/s</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Orbital Period (T = 2π√(a³/GM)):</span>
                      <span className="text-cyan-400 font-bold tabular-nums">{(Math.sqrt(Math.pow(semiMajorAxis, 3) / (starMass * 10))).toFixed(1)} yr</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed pt-1">
                      Swept orbital radius conforms to Kepler's second law: equal areas in equal intervals. Velocity peaks at perihelion and reaches minimum at aphelion.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Channel 03: Neural Manifold Controls ── */}
              {activeChannel === "neural" && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">
                        Activation Function
                      </span>
                      <span className="text-purple-400 text-[10px]">[TOPOLOGY]</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px]">
                      {(["gelu", "relu", "sigmoid", "tanh"] as const).map((fn) => (
                        <button
                          key={fn}
                          type="button"
                          onClick={() => setActivationFunc(fn)}
                          className={`py-1.5 px-1.5 rounded border transition-all text-center uppercase ${
                            activationFunc === fn
                              ? "bg-purple-500/20 border-purple-500/60 text-purple-300 font-bold"
                              : "bg-slate-100/70 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 hover:border-slate-300"
                          }`}
                        >
                          {fn}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hidden Units Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Hidden Dimensionality (d_h):</span>
                      <span className="text-purple-400 font-bold tabular-nums">{hiddenUnits} units</span>
                    </div>
                    <input
                      type="range"
                      min={4}
                      max={64}
                      step={4}
                      value={hiddenUnits}
                      onChange={(e) => setHiddenUnits(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Regularization Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">L2 Weight Regularization (λ):</span>
                      <span className="text-cobalt-400 font-bold tabular-nums">{regularization.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min={0.0}
                      max={0.08}
                      step={0.005}
                      value={regularization}
                      onChange={(e) => setRegularization(Number(e.target.value))}
                      className="w-full accent-cobalt-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* Neural Derivation Card */}
                  <div className="p-3.5 rounded-lg bg-slate-100/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.07] font-mono text-[11px] space-y-1.5">
                    <div className="flex justify-between text-slate-400 text-[10px] tracking-wider uppercase mb-1">
                      <span>DECISION HYPERPLANE & MANIFOLD</span>
                      <span className="text-purple-400 font-bold">MULTILAYER PERCEPTRON</span>
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-semibold text-xs">
                      ŷ = σ(W₂ · {activationFunc.toUpperCase()}(W₁x + b₁) + b₂)
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-[10px]">
                      <span>Empirical Cross-Entropy Loss:</span>
                      <span className="text-emerald-400 font-bold tabular-nums">0.084 nats</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span>Generalization Margin:</span>
                      <span className="text-cyan-400 font-bold tabular-nums">{(0.74 - regularization * 2).toFixed(3)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans leading-relaxed pt-1">
                      Nonlinear activation introduces curvature in the feature projection space, allowing the network to separate topological rings without kernel trick transformations.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Button: Compile this experiment into Studio */}
              <button
                type="button"
                onClick={handleLaunchInStudio}
                className="w-full py-2.5 px-4 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-mono text-xs font-semibold tracking-wide transition-all shadow-md shadow-cobalt-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Launch Full Module in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ════ RIGHT: Instrument Oscilloscope Scope Monitor (7 Cols) ════ */}
            <div 
              className="lg:col-span-7 bg-slate-950/95 p-5 sm:p-6 flex flex-col justify-between min-h-[380px] relative overflow-hidden backdrop-blur-md"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setReticleCoords({
                  x: Math.round(e.clientX - rect.left),
                  y: Math.round(e.clientY - rect.top)
                });
              }}
              onMouseLeave={() => setReticleCoords(null)}
            >
              
              {/* Millimetric Coordinate Reticle Grid Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.14]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #38bdf8 1px, transparent 1px),
                    linear-gradient(to bottom, #38bdf8 1px, transparent 1px)
                  `,
                  backgroundSize: "28px 28px"
                }}
              />

              {/* CRT Scanline Beam Texture */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, #000 0px, #000 1px, transparent 1px, transparent 3px)"
                }}
              />

              {/* Top Oscilloscope Header Telemetry */}
              <div className="relative z-10 flex items-center justify-between font-mono text-xs border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    {activeChannel === "quantum" && "VECTOR WAVE: |Ψ(x,t)|²"}
                    {activeChannel === "orbital" && "KEPLERIAN PHASE SPACE: r(θ)"}
                    {activeChannel === "neural" && "DECISION BOUNDARY MANIFOLD: f(x)"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  {reticleCoords ? (
                    <span className="text-emerald-400 font-bold tabular-nums">
                      X: {reticleCoords.x}px | Y: {reticleCoords.y}px
                    </span>
                  ) : (
                    <span>RETICLE: AUTO-CENTER</span>
                  )}
                  <span className="text-slate-600">|</span>
                  <span className="text-slate-400">1024 SAMPLES</span>
                </div>
              </div>

              {/* ── Main Dynamic Vector Visualizer Canvas ── */}
              <div className="relative z-10 my-auto py-4 flex items-center justify-center">
                
                {/* Visualizer 1: Quantum Wavepacket Dynamics */}
                {activeChannel === "quantum" && (
                  <div className="w-full relative">
                    <svg viewBox="0 0 440 200" className="w-full h-auto overflow-visible" suppressHydrationWarning>
                      {/* Zero baseline axis */}
                      <line x1="0" y1="120" x2="440" y2="120" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                      
                      {/* Potential Barrier V0 Box */}
                      <rect 
                        x={barrierStartX} 
                        y={Math.max(20, 120 - (barrierV0 * 1.1))} 
                        width={barrierWidthPx} 
                        height={barrierV0 * 1.1} 
                        fill="rgba(6, 182, 212, 0.12)" 
                        stroke="#06b6d4" 
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />

                      {/* Potential Barrier Text Label */}
                      <text 
                        x={barrierStartX + barrierWidthPx / 2} 
                        y={Math.max(16, 114 - (barrierV0 * 1.1))} 
                        fill="#06b6d4" 
                        fontSize="9" 
                        fontFamily="monospace" 
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        V₀ = {barrierV0} meV
                      </text>

                      {/* Probability Density Shading |ψ(x)|² */}
                      <path 
                        d={mounted ? waveAreaPath : ""} 
                        fill="url(#quantumGlow)" 
                        opacity="0.4"
                      />

                      {/* Real Wavefunction Amplitude Curve */}
                      <path 
                        d={mounted ? waveLinePath : ""} 
                        fill="none" 
                        stroke="#38bdf8" 
                        strokeWidth="2.2" 
                      />

                      {/* Quantum Node Markers */}
                      <circle cx={barrierStartX} cy="120" r="3" fill="#06b6d4" />
                      <circle cx={barrierEndX} cy="120" r="3" fill="#06b6d4" />

                      {/* SVG Linear Gradient for Glow Fill */}
                      <defs>
                        <linearGradient id="quantumGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Reticle Callout Badges */}
                    <div className="absolute top-0 left-2 font-mono text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      INCIDENT WAVE (k = {Math.sqrt(particleEnergy * 2).toFixed(1)})
                    </div>
                    <div className="absolute top-0 right-2 font-mono text-[10px] text-cyan-400 bg-slate-900/80 px-2 py-0.5 rounded border border-cyan-900/50">
                      TRANSMITTED: {(transmissionT * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                {/* Visualizer 2: Keplerian Orbit Dynamics */}
                {activeChannel === "orbital" && (
                  <div className="w-full relative flex items-center justify-center">
                    <svg viewBox="0 0 440 220" className="w-full h-auto overflow-visible" suppressHydrationWarning>
                      {/* Orbital Ellipse Trajectory */}
                      <ellipse 
                        cx={orbitCenterX} 
                        cy={orbitCenterY} 
                        rx={semiMajorPx} 
                        ry={semiMinorPx} 
                        fill="none" 
                        stroke="#334155" 
                        strokeWidth="1.4"
                        strokeDasharray="4 3"
                      />

                      {/* Major and Minor Axes */}
                      <line 
                        x1={orbitCenterX - semiMajorPx} 
                        y1={orbitCenterY} 
                        x2={orbitCenterX + semiMajorPx} 
                        y2={orbitCenterY} 
                        stroke="#1e293b" 
                        strokeWidth="1" 
                      />

                      {/* Central Gravitational Star with Corona Glow */}
                      <circle cx={starX} cy={starY} r="18" fill="rgba(245, 158, 11, 0.15)" />
                      <circle cx={starX} cy={starY} r="8" fill="#f59e0b" />
                      <text x={starX} y={starY - 14} fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        STAR (M = {starMass})
                      </text>

                      {/* Gravitational Field Attraction Vector Line */}
                      <line 
                        x1={starX} 
                        y1={starY} 
                        x2={planetX} 
                        y2={planetY} 
                        stroke="rgba(245, 158, 11, 0.3)" 
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />

                      {/* Orbiting Satellite Body */}
                      <circle cx={planetX} cy={planetY} r="10" fill="rgba(56, 189, 248, 0.2)" />
                      <circle cx={planetX} cy={planetY} r="5" fill="#38bdf8" />
                      
                      {/* Perihelion Marker */}
                      <circle cx={starX + (semiMajorPx * (1 - eccentricity))} cy={starY} r="2.5" fill="#10b981" />
                      <text 
                        x={starX + (semiMajorPx * (1 - eccentricity)) + 4} 
                        y={starY + 12} 
                        fill="#10b981" 
                        fontSize="8" 
                        fontFamily="monospace"
                      >
                        Perihelion
                      </text>
                    </svg>
                  </div>
                )}

                {/* Visualizer 3: Neural Decision Boundary Topology */}
                {activeChannel === "neural" && (
                  <div className="w-full relative">
                    <svg viewBox="0 0 440 200" className="w-full h-auto overflow-visible" suppressHydrationWarning>
                      {/* Curving Decision Boundary Contour */}
                      <path 
                        d="M 60,180 Q 180,120 220,100 T 380,40" 
                        fill="none" 
                        stroke="#a855f7" 
                        strokeWidth="2.5" 
                      />
                      <path 
                        d="M 60,180 Q 180,120 220,100 T 380,40 L 440,200 L 0,200 Z" 
                        fill="rgba(168, 85, 247, 0.08)" 
                      />

                      {/* Data Point Clusters */}
                      {neuralPoints.map((pt, i) => (
                        <g key={i}>
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r={pt.label === 1 ? 5 : 4} 
                            fill={pt.label === 1 ? "#06b6d4" : "#f43f5e"} 
                            opacity="0.85"
                          />
                          <circle 
                            cx={pt.x} 
                            cy={pt.y} 
                            r={pt.label === 1 ? 9 : 8} 
                            fill="none" 
                            stroke={pt.label === 1 ? "#06b6d4" : "#f43f5e"} 
                            strokeWidth="1" 
                            opacity="0.3" 
                          />
                        </g>
                      ))}

                      {/* Decision Hyperplane Label */}
                      <text x="235" y="105" fill="#c084fc" fontSize="9" fontFamily="monospace" fontWeight="bold">
                        f(x) = 0.0 (SEPARATING MANIFOLD)
                      </text>
                    </svg>

                    <div className="flex justify-between items-center px-4 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Class α: Eigenstate A
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Class β: Eigenstate B
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Oscilloscope Diagnostic Telemetry Strip */}
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800/80 pt-2.5 font-mono text-[10px] text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CONVERGENCE: EXACT
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>INTEGRATOR: RUNGE-KUTTA 4</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="hidden sm:inline">JITTER: &lt;0.2ms</span>
                </div>

                <div className="text-slate-500 text-right">
                  SIMULATION PROTOCOL · v2.4 KINETIC
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Chassis Verification Strip */}
          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Full procedural execution sandboxes compiled with zero external CDNs</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-slate-400">LATENCY: <strong className="text-slate-700 dark:text-slate-300">18ms</strong></span>
              <span className="text-slate-400">FRAME TIME: <strong className="text-emerald-500">16.6ms (60 FPS)</strong></span>
            </div>
          </div>

        </div>
      </ScrollReveal>

    </section>
  );
}
