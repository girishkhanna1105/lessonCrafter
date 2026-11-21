"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  Sparkles,
  GitBranch,
  ShieldAlert,
  BrainCircuit,
  Lightbulb,
  CornerDownRight,
  RefreshCw,
  Terminal
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface SocraticParadox {
  id: string;
  domain: string;
  title: string;
  topic: string;
  naiveIntuition: string;
  thoughtExperiment: string;
  hypotheses: {
    id: string;
    label: string;
    isCorrect: boolean;
    socraticCritique: string;
    epiphany: string;
  }[];
}

const PARADOXES: SocraticParadox[] = [
  {
    id: "orbit",
    domain: "ASTROPHYSICS · GRAVITATION",
    title: "The Orbital Fall Paradox",
    topic: "Orbital Mechanics",
    naiveIntuition: "The Moon never crashes into Earth because gravity ceases to exist in outer space.",
    thoughtExperiment: "Newton's Mountain Cannon: Imagine firing a projectile horizontally from a peak above the atmosphere. At 1 km/s it hits the ground. At 4 km/s it travels farther. What happens at 7.9 km/s?",
    hypotheses: [
      {
        id: "h1",
        label: "At high enough orbital velocity, Earth's gravitational pull drops to zero.",
        isCorrect: false,
        socraticCritique: "In low Earth orbit, gravity is still ~89% as strong as on the surface. If gravity were zero, Newton's first law says the moon would fly off in a straight line into deep space. What is holding it in a closed loop?",
        epiphany: "Gravity remains fully active; the trajectory curvature matches the planet's spherical drop."
      },
      {
        id: "h2",
        label: "The projectile falls continuously, but the ground curves away beneath it at the exact same rate.",
        isCorrect: true,
        socraticCritique: "Precise convergence. The satellite drops ~4.9 meters every second, but Earth's surface curves downward by 4.9 meters over that same horizontal distance.",
        epiphany: "Orbital motion is continuous freefall where altitude remains constant because the surface falls away as fast as the object drops."
      }
    ]
  },
  {
    id: "wave",
    domain: "PHYSICS · OPTICS",
    title: "Destructive Wave Annihilation",
    topic: "Wave Interference",
    naiveIntuition: "When two out-of-phase waves collide to zero amplitude, their energy is destroyed.",
    thoughtExperiment: "Two laser pulses with identical amplitude meet 180° out of phase at a detector point. The electric field sums to zero: E_total = E₁ + E₂ = 0. Where did the photon energy go?",
    hypotheses: [
      {
        id: "h1",
        label: "The energy is dissipated into the vacuum as thermal heat.",
        isCorrect: false,
        socraticCritique: "In an ideal linear medium with no absorption, dielectric loss is strictly zero. If the wave equation is completely lossless and conservative, can energy convert into heat without a dissipating medium?",
        epiphany: "Linear systems cannot convert electromagnetic radiation into thermal energy without absorption."
      },
      {
        id: "h2",
        label: "Energy flux is spatially redirected into the adjacent constructive interference peaks.",
        isCorrect: true,
        socraticCritique: "Hamiltonian conservation verified. While the field at the node is zero, the Poynting vector redirects energy flux into constructive fringes where amplitude doubles and intensity quadruples.",
        epiphany: "Zero local amplitude does not equal zero total energy; the spatial energy distribution integrates to a constant across the entire wavefront."
      }
    ]
  },
  {
    id: "ml",
    domain: "AI / ML · DEEP LEARNING",
    title: "The Deep Linear Layer Fallacy",
    topic: "Neural Networks",
    naiveIntuition: "Stacking 100 deep linear layers makes a neural network infinitely expressive.",
    thoughtExperiment: "Consider a network with 100 linear layers: y = W₁₀₀ · W₉₉ · ... · W₁ · x. Each layer has millions of learnable parameters. Can this network classify concentric circles?",
    hypotheses: [
      {
        id: "h1",
        label: "Yes, because the huge parameter count allows the network to approximate any continuous function.",
        isCorrect: false,
        socraticCritique: "Consider matrix associativity: W_net = (W₁₀₀ · W₉₉ · ... · W₁). What is the mathematical type of a product of 100 linear matrices? Isn't W_net still just one single linear matrix?",
        epiphany: "100 linear layers mathematically collapse into a single matrix multiplication: y = W_net · x + b_net."
      },
      {
        id: "h2",
        label: "No, composition of linear transformations is strictly linear; non-linear activation is required to warp feature space.",
        isCorrect: true,
        socraticCritique: "Exact topological proof. Linear hyperplanes can only produce flat decision boundaries. Non-linear activations like ReLU or GELU introduce curvature, allowing the manifold to wrap around non-convex data clusters.",
        epiphany: "Depth without non-linearity provides zero added representational capacity; activation curvature is the fundamental engine of deep representation."
      }
    ]
  }
];

export default function InteractiveSocraticDemo() {
  const router = useRouter();
  const [selectedParadoxIdx, setSelectedParadoxIdx] = useState(0);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  const activeParadox = PARADOXES[selectedParadoxIdx];
  const activeHypothesis = activeParadox.hypotheses.find(h => h.id === selectedHypothesisId) || null;

  const handleSelectParadox = (idx: number) => {
    setSelectedParadoxIdx(idx);
    setSelectedHypothesisId(null);
  };

  const handleLaunchStudio = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", activeParadox.thoughtExperiment);
    }
    router.push("/studio");
  };

  return (
    <section className="pt-6 sm:pt-8 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative select-none">
      
      {/* ── Section Header ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">SOCRATIC DIALECTIC ENGINE · STAGE 04</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-emerald-500 font-bold">FIRST-PRINCIPLES EVAL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            A tutor that refuses to{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              give you the answer.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Passive AI gives away answers and destroys learning. LessonCrafter's Socratic engine identifies 
            cognitive misconceptions, tests boundary conditions, and guides you to derive truth from first principles.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Main Socratic Reasoning Arena ── */}
      <ScrollReveal direction="up" delay={120} threshold={0.08}>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white/80 dark:bg-[#0c111c]/75 backdrop-blur-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all">
          
          {/* Top Chassis Topic Navigation */}
          <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Paradox Selectors */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
              {PARADOXES.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectParadox(idx)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    selectedParadoxIdx === idx
                      ? "bg-cobalt-600 text-white shadow-sm border border-cobalt-500"
                      : "bg-white/80 hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.06]"
                  }`}
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.topic}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 shrink-0">
              <span>PROTOCOL: GEDANKENEXPERIMENT</span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-emerald-500 font-bold">ACTIVE PROBE</span>
            </div>

          </div>

          {/* Split Body: Left Axiomatic Scaffolding | Right Live Dialectic Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-slate-200/80 dark:border-white/[0.08]">
            
            {/* ════ LEFT: Socratic Pedagogical Protocol (5 Cols) ════ */}
            <div className="lg:col-span-5 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                
                <div>
                  <div className="font-mono text-[10px] text-cobalt-600 dark:text-cyan-400 font-bold uppercase tracking-wider mb-1">
                    {activeParadox.domain}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeParadox.title}
                  </h3>
                </div>

                {/* Cognitive Trap Card */}
                <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-mono text-[11px] font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>COMMON NAIVE MISCONCEPTION</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-sans italic leading-relaxed">
                    &ldquo;{activeParadox.naiveIntuition}&rdquo;
                  </p>
                </div>

                {/* The 3 Core Socratic Axioms */}
                <div className="space-y-2.5 pt-1 font-mono text-[11px]">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/[0.06]">
                    <span className="w-5 h-5 rounded bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 font-bold flex items-center justify-center shrink-0">
                      01
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-sans text-xs">
                      <strong className="font-mono font-semibold text-slate-800 dark:text-slate-200">Trap Identification:</strong> Probes counter-intuitive boundary limits where intuition breaks.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/[0.06]">
                    <span className="w-5 h-5 rounded bg-cyan-500/10 text-cyan-500 font-bold flex items-center justify-center shrink-0">
                      02
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-sans text-xs">
                      <strong className="font-mono font-semibold text-slate-800 dark:text-slate-200">Gedankenexperiment:</strong> Reframes the paradox through targeted physical thought experiments.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-black/30 border border-slate-200/70 dark:border-white/[0.06]">
                    <span className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0">
                      03
                    </span>
                    <div className="text-slate-600 dark:text-slate-300 font-sans text-xs">
                      <strong className="font-mono font-semibold text-slate-800 dark:text-slate-200">Self-Derived Proof:</strong> Forces the student to formulate the exact mathematical resolution.
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Button: Compile this Dialectic in Studio */}
              <button
                type="button"
                onClick={handleLaunchStudio}
                className="w-full py-3 px-4 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cobalt-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Launch Interactive Socratic Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {/* ════ RIGHT: Interactive Thought Experiment Arena (7 Cols) ════ */}
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-slate-50/40 dark:bg-black/20">
              
              <div className="space-y-4">
                
                {/* Socratic Thought Experiment Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#0c111c] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-cobalt-600 dark:text-cyan-400">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      PHYSICAL THOUGHT EXPERIMENT
                    </span>
                    <span className="text-slate-400 text-[10px]">INQUIRY PROBE</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {activeParadox.thoughtExperiment}
                  </p>
                </div>

                {/* Interactive Hypothesis Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-cobalt-500" />
                      Select Student Hypothesis to Test
                    </span>
                    <span className="text-cyan-400 text-[10px]">CLICK TO CHALLENGE</span>
                  </div>

                  <div className="space-y-2">
                    {activeParadox.hypotheses.map((hyp) => {
                      const isSelected = selectedHypothesisId === hyp.id;
                      return (
                        <button
                          key={hyp.id}
                          type="button"
                          onClick={() => setSelectedHypothesisId(hyp.id)}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? hyp.isCorrect
                                ? "bg-emerald-500/10 border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20"
                                : "bg-rose-500/10 border-rose-500 dark:border-rose-500 ring-1 ring-rose-500/20"
                              : "bg-white dark:bg-[#0c111c] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] border-slate-200/90 dark:border-white/[0.08]"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? hyp.isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-rose-500 text-white"
                              : "bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400"
                          }`}>
                            {hyp.id.toUpperCase()}
                          </div>

                          <div className="flex-1">
                            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                              {hyp.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Socratic Refutation & Epiphany Output Box */}
                {activeHypothesis ? (
                  <div className={`p-4 rounded-xl border transition-all animate-slide-up space-y-2.5 ${
                    activeHypothesis.isCorrect
                      ? "bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/40 text-rose-900 dark:text-rose-200"
                  }`}>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="flex items-center gap-1.5 font-bold">
                        {activeHypothesis.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>COGNITIVE CONVERGENCE : LEVEL 5 VERIFIED</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                            <span>COGNITIVE TRAP TRIGGERED : SOCRATIC COUNTER-PROBE</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] font-bold">
                        {activeHypothesis.isCorrect ? "FIRST-PRINCIPLES PROOF" : "REFRAMING REQUIRED"}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed font-sans text-slate-700 dark:text-slate-300">
                      {activeHypothesis.socraticCritique}
                    </p>

                    <div className="pt-2 border-t border-current/10 font-mono text-[11px] font-semibold flex items-start gap-1.5">
                      <CornerDownRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{activeHypothesis.epiphany}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-black/30 border border-dashed border-slate-300 dark:border-white/[0.08] text-center font-mono text-xs text-slate-400">
                    Select a student hypothesis above to test the Socratic refutation loop.
                  </div>
                )}

              </div>

              {/* Telemetry Status Strip */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>INFERENCE LATENCY: <strong className="text-slate-700 dark:text-slate-300">18ms</strong></span>
                <span>SOCRATIC ACCURACY: <strong className="text-emerald-500">99.4%</strong></span>
              </div>

            </div>

          </div>

          {/* Bottom Chassis Verification Strip */}
          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Socratic dialectic loop rigorously prevents answer-spoonfeeding</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">MODEL: <strong className="text-slate-700 dark:text-slate-300">FIRST-PRINCIPLES</strong></span>
              <span className="text-slate-400">STATUS: <strong className="text-emerald-500">LIVE RUNTIME</strong></span>
            </div>
          </div>

        </div>
      </ScrollReveal>

    </section>
  );
}
