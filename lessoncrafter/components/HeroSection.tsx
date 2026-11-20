"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Terminal, 
  Atom, 
  BrainCircuit, 
  Sigma, 
  Dna, 
  CornerDownLeft,
  CheckCircle2,
  Compass,
  Layers,
  ArrowRight
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

  // 3D Canvas Reference & Interactive Mouse Parallax
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [telemetry, setTelemetry] = useState({
    freq: 440,
    amplitude: 1.42,
    coherence: 99.8,
    phase: 0,
    vectorZ: 0.707
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = relX * 40;
      mouseRef.current.targetY = relY * 25;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // ── 3D Mathematical Perspective Grid Engine (60 FPS) ──
    const render = () => {
      time += 0.02;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Camera & Horizon geometry
      const horizonY = h * 0.44;
      const fov = 420;
      const cameraY = -65 + mouseRef.current.y;
      const cameraX = mouseRef.current.x;

      const cols = 28;
      const rows = 24;
      const colStep = 24;
      const zNear = 3.5;
      const zFar = 28;
      const zStep = (zFar - zNear) / rows;

      // Project (X, Y, Z) point to 2D screen coordinates
      const project = (gx: number, gy: number, gz: number) => {
        const effZ = Math.max(0.5, gz);
        const scale = fov / effZ;
        const sx = w / 2 + (gx - cameraX) * scale;
        const sy = horizonY + (gy - cameraY) * scale;
        return { sx, sy, scale };
      };

      // Compute animated 3D undulation surface: z = A*sin(...)
      const getY = (gx: number, gz: number) => {
        const d = Math.sqrt(gx * gx + gz * gz);
        const wave1 = Math.sin(gx * 0.22 + time * 1.8) * 12;
        const wave2 = Math.cos(gz * 0.28 - time * 2.2) * 14;
        const ripple = Math.sin(d * 0.35 - time * 3) * 6;
        return wave1 + wave2 + ripple;
      };

      // 1. Draw Transverse Perspective Lines (running horizontally)
      for (let r = 0; r <= rows; r++) {
        const gz = zNear + r * zStep;
        const alpha = Math.max(0, Math.min(0.45, (1 - (gz - zNear) / (zFar - zNear)) * 0.55));
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.lineWidth = Math.max(0.8, 2.2 - (gz / zFar) * 1.6);

        let first = true;
        for (let c = -cols / 2; c <= cols / 2; c++) {
          const gx = c * colStep;
          const gy = getY(gx, gz);
          const { sx, sy } = project(gx, gy, gz);

          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }

      // 2. Draw Longitudinal Perspective Rays (converging toward vanishing horizon)
      for (let c = -cols / 2; c <= cols / 2; c += 2) {
        const gx = c * colStep;
        
        ctx.beginPath();
        let first = true;
        for (let r = 0; r <= rows; r++) {
          const gz = zNear + r * zStep;
          const gy = getY(gx, gz);
          const { sx, sy } = project(gx, gy, gz);
          const alpha = Math.max(0, Math.min(0.35, (1 - (gz - zNear) / (zFar - zNear)) * 0.45));

          ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = Math.max(0.7, 1.8 - (gz / zFar) * 1.2);

          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();
      }

      // 3. Draw Luminous Horizon Core Line
      const grad = ctx.createLinearGradient(w * 0.1, horizonY, w * 0.9, horizonY);
      grad.addColorStop(0, "rgba(59, 130, 246, 0)");
      grad.addColorStop(0.5, "rgba(59, 130, 246, 0.45)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0)");
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Subtle background telemetry ticker
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        freq: 440 + Math.floor(Math.sin(Date.now() / 1000) * 8),
        amplitude: Number((1.42 + Math.cos(Date.now() / 1500) * 0.08).toFixed(2)),
        coherence: Number((99.6 + Math.sin(Date.now() / 2000) * 0.3).toFixed(1)),
        phase: Math.floor((Date.now() / 50) % 360),
        vectorZ: Number((0.707 + Math.sin(Date.now() / 1200) * 0.04).toFixed(3))
      }));
    }, 150);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleCreate = (topicText?: string) => {
    const text = topicText || prompt;
    if (text.trim()) {
      localStorage.setItem("pending_prompt", text.trim());
    }
    router.push("/studio");
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[96vh] pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden select-none">
      
      {/* ── 1. Pure HTML5 Interactive 3D Perspective Wave Canvas ── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Atmospheric Top & Bottom Horizon Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/95 pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--tw-gradient-stops))] from-transparent via-background/40 to-background pointer-events-none z-0" />

      {/* ── 2. Integrated Architectural Widescreen Stage ── */}
      <div className="max-w-7xl w-full mx-auto relative z-10 flex flex-col items-center">

        {/* Top Status Header */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-md bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-6 animate-slide-up backdrop-blur-md">
          <span className="flex items-center gap-1.5 font-semibold text-cobalt-600 dark:text-cobalt-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            3D ENGINE: 60 FPS
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-slate-500 dark:text-slate-400">PARAMETRIC STEM WORKBENCH</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-cyan-500 font-bold hidden sm:inline">v2.4 KINETIC</span>
        </div>

        {/* Main Stage Grid: Integrated Side Wings + Wide Center Console */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* ════ LEFT WING: Live 3D Mathematical Vector Coordinate HUD ════ */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-start gap-4 text-left font-mono text-[11px] animate-slide-right select-none">
            {/* Technical Header with Leader Line */}
            <div className="w-full flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <span className="text-[10px] tracking-widest uppercase font-bold text-cobalt-500">
                // SYSTEM VECTOR
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
            </div>

            {/* Live Reactive Telemetry Readouts (Bound to 3D Canvas) */}
            <div className="w-full space-y-2 p-3.5 rounded-lg bg-slate-50/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-md shadow-sm">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">Oscillation:</span>
                <span className="text-cobalt-500 font-bold">{telemetry.freq} Hz</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">Amplitude:</span>
                <span className="font-semibold">{telemetry.amplitude} V</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">Phase Angle φ:</span>
                <span className="text-cyan-400 font-bold">{telemetry.phase}°</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">Eigenstate ||Ψ||:</span>
                <span className="text-emerald-500 font-bold">{telemetry.vectorZ}</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Coherence:</span>
                <span className="text-emerald-400 font-bold">{telemetry.coherence}%</span>
              </div>
            </div>

            {/* Micro Coordinate Pill */}
            <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Camera Parallax: Mouse-Interactive</span>
            </div>
          </div>

          {/* ════ CENTER: The Authoritative Headline & Instrument Console ════ */}
          <div className="lg:col-span-6 flex flex-col items-center text-center">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-5 animate-slide-up delay-100">
              Don't just read about complex systems.{" "}
              <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
                Experiment with them.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-8 animate-slide-up delay-200">
              Transform any theorem, physical law, or algorithm into an interactive 
              parameter simulation with step-by-step derivations and Socratic inquiry.
            </p>

            {/* The Instrument Command Console */}
            <div className="w-full max-w-xl mx-auto mb-6 animate-slide-up delay-300 text-left">
              <div className="bg-white/95 dark:bg-[#0c111c]/95 border border-slate-200 dark:border-white/[0.1] rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:border-cobalt-500/80 focus-within:ring-1 focus-within:ring-cobalt-500/30 backdrop-blur-xl">
                
                {/* Console Header Bar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/80 dark:bg-slate-900/60 text-[11px] font-mono text-slate-500 dark:text-slate-400 select-none">
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
                    className="px-5 py-2.5 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-md shadow-cobalt-600/20 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
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

          {/* ════ RIGHT WING: Pedagogical Pipeline Benchmark Matrix ════ */}
          <div className="hidden lg:flex lg:col-span-3 flex-col items-start gap-4 text-left font-mono text-[11px] animate-slide-left select-none">
            {/* Technical Header with Leader Line */}
            <div className="w-full flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <span className="text-[10px] tracking-widest uppercase font-bold text-cyan-400">
                // COMPILATION PIPELINE
              </span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
            </div>

            {/* Integrated Stage Flow Cards */}
            <div className="w-full space-y-2 p-3.5 rounded-lg bg-slate-50/70 dark:bg-black/40 border border-slate-200/80 dark:border-white/[0.07] backdrop-blur-md shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">01 · Cognitive Anchor</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">Bloom L5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">02 · Mathematical Proof</span>
                <span className="text-[10px] text-slate-400 font-semibold">TeX S² → ℂ²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">03 · Simulation Engine</span>
                <span className="text-[10px] text-cobalt-500 font-bold">60FPS Live</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">04 · Socratic Duel</span>
                <span className="text-[10px] text-cyan-400 font-bold">Counter-Test</span>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Inference Rate:</span>
                <span className="text-cyan-400 font-bold">52 tokens/s · 24ms</span>
              </div>
            </div>

            {/* Micro Verification Tag */}
            <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Full Executable Sandboxes</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
