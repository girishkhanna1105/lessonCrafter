"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Atom, 
  Binary, 
  Dna, 
  TrendingUp, 
  ArrowRight, 
  Sliders, 
  HelpCircle,
  GitCommit,
  CheckCircle2,
  Terminal
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface DAGNode {
  step: string;
  type: "FOUNDATION" | "DERIVATION" | "SIMULATION" | "SOCRATIC";
  title: string;
  detail: string;
  badge: string;
}

interface CurriculumTrack {
  id: string;
  domain: string;
  category: string;
  icon: any;
  title: string;
  level: string;
  desc: string;
  formula: string;
  prompt: string;
  dagNodes: DAGNode[];
  simulationSpec: {
    engine: string;
    description: string;
    telemetry: string;
  };
  socraticProbe: {
    question: string;
    trapConcept: string;
  };
}

const TRACKS: CurriculumTrack[] = [
  {
    id: "quantum",
    domain: "PHYSICS : QUANTUM",
    category: "Quantum Mechanics",
    icon: Atom,
    title: "Quantum Entanglement & Bell State Inequality",
    level: "BLOOM L5 · COLLEGE UNDERGRAD",
    desc: "Deconstruct quantum state superposition, Bell states in Hilbert space, and mathematically prove the violation of classical local realism.",
    formula: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
    prompt: "Quantum Computing: Entanglement, Bell Inequalities & Superposition with interactive spin measurement and state vector visualization",
    dagNodes: [
      {
        step: "01",
        type: "FOUNDATION",
        title: "State Vectors & Superposition in ℂ²",
        detail: "Dirac bra-ket notation, orthonormal basis states |0⟩ and |1⟩, and measurement probability postulates.",
        badge: "Postulate 1"
      },
      {
        step: "02",
        type: "DERIVATION",
        title: "Tensor Products & Bell State Generation",
        detail: "Applying Hadamard and CNOT gates to transform product state |00⟩ into maximally entangled Bell pairs.",
        badge: "Exact Proof"
      },
      {
        step: "03",
        type: "SIMULATION",
        title: "Bloch Sphere & Spin Projector Lab",
        detail: "Interactive Bloch sphere rotation with live wavepacket collapse and quantum correlation coefficients.",
        badge: "60 FPS Vector"
      },
      {
        step: "04",
        type: "SOCRATIC",
        title: "The Bell-CHSH Dialectical Counter-Test",
        detail: "Testing why local hidden variables cannot explain the observed quantum correlation bound (|S| ≤ 2 vs 2√2).",
        badge: "Misconception Probe"
      }
    ],
    simulationSpec: {
      engine: "Interactive 3D Bloch Sphere",
      description: "Interactive polar and azimuthal angle dials with real-time projective measurement probability Born distribution.",
      telemetry: "STATE: ENTANGLED | CHSH BOUND: S = 2.828 | RUNTIME: WEBGPU"
    },
    socraticProbe: {
      question: "Why does measuring Qubit A instantaneously determine Qubit B without violating relativistic causality?",
      trapConcept: "No-Signaling Theorem & Density Matrix Invariance"
    }
  },
  {
    id: "ml",
    domain: "AI / ML : ARCHITECTURE",
    category: "Neural Architectures",
    icon: Binary,
    title: "Transformer Attention & Scaled Dot-Product Mechanics",
    level: "BLOOM L5 · ADVANCED SYSTEMS",
    desc: "Deconstruct Query, Key, and Value projections, multi-head parallel attention matrices, and softmax temperature dynamics.",
    formula: "Attention(Q, K, V) = softmax(Q·Kᵀ / √dₖ)·V",
    prompt: "Transformers & Deep Learning: Multi-Head Self-Attention Mechanism, Query-Key-Value Dot Products, and Softmax Temperature",
    dagNodes: [
      {
        step: "01",
        type: "FOUNDATION",
        title: "Sequential Bottlenecks & Attention Genesis",
        detail: "Why recurrence creates computational serialization and how all-to-all attention bypasses the bottleneck.",
        badge: "System Vector"
      },
      {
        step: "02",
        type: "DERIVATION",
        title: "Linear Projections & Dot-Product Energy",
        detail: "Projecting input embeddings into Q, K, V subspaces and computing the pairwise affinity matrix.",
        badge: "Linear Algebra"
      },
      {
        step: "03",
        type: "SIMULATION",
        title: "Live Q·Kᵀ Attention Heatmap Sandbox",
        detail: "Adjust temperature scale √dₖ to observe softmax entropy sharpening and token attention redistribution.",
        badge: "Live Tensor Scope"
      },
      {
        step: "04",
        type: "SOCRATIC",
        title: "Dimensional Variance & Softmax Saturation",
        detail: "Probing what happens to gradients when dₖ scales without the square-root normalizing denominator.",
        badge: "Gradient Probe"
      }
    ],
    simulationSpec: {
      engine: "Interactive Q·Kᵀ Affinity Heatmap",
      description: "Real-time 8x8 cross-attention matrix with adjustable Softmax temperature slider and residual mixing.",
      telemetry: "TENSOR: [B, H, S, d_k] | FLOPs: 4.2 GFLOPs | BACKPROP: AUTODIFF"
    },
    socraticProbe: {
      question: "What is the exact mathematical failure mode of Softmax attention when dₖ is large and unscaled?",
      trapConcept: "Gradient Vanishing via Exponential Saturation"
    }
  },
  {
    id: "bio",
    domain: "BIOLOGY : GENOMICS",
    category: "Molecular Genetics",
    icon: Dna,
    title: "CRISPR-Cas9 Cleavage & Repair Pathways",
    level: "BLOOM L4 · BIOCHEMISTRY",
    desc: "Explore single-guide RNA hybridization, Protospacer Adjacent Motif (PAM) verification, and double-strand break repair.",
    formula: "Cas9:sgRNA + DNA(PAM) ⟶ RuvC + HNH Cleavage",
    prompt: "Cellular Genetics: CRISPR-Cas9 Molecular Mechanism, Guide RNA Targeting, and Non-Homologous End Joining",
    dagNodes: [
      {
        step: "01",
        type: "FOUNDATION",
        title: "Bacterial Immunity & Cas9 Architecture",
        detail: "Structural anatomy of Cas9: Recognition (REC) lobe, Nuclease (NUC) lobe, and sgRNA scaffold loading.",
        badge: "Structural Bio"
      },
      {
        step: "02",
        type: "DERIVATION",
        title: "PAM (5'-NGG-3') Kinetic Interrogation",
        detail: "Thermodynamics of local DNA melting and 20-nucleotide seed sequence base-pairing kinetics.",
        badge: "Thermodynamics"
      },
      {
        step: "03",
        type: "SIMULATION",
        title: "Target Strand Cleavage & R-Loop Simulator",
        detail: "Interactive DNA sequence scanner with guide mismatch tolerance and off-target risk scoring.",
        badge: "Sequence Engine"
      },
      {
        step: "04",
        type: "SOCRATIC",
        title: "NHEJ Mutagenesis vs HDR Template Repair",
        detail: "Investigating why non-homologous end joining introduces frameshifts while homology repair requires a donor.",
        badge: "Pathway Challenge"
      }
    ],
    simulationSpec: {
      engine: "Interactive DNA Strand & Cleavage Simulator",
      description: "Real-time nucleotide matching canvas with adjustable mismatch tolerance and repair pathway selector.",
      telemetry: "ENERGY: ΔG = -14.2 kcal/mol | PAM: CONFIRMED | SPECIFICITY: 99.4%"
    },
    socraticProbe: {
      question: "What exact biochemical step fails if the genomic target has a single point mutation in the PAM motif?",
      trapConcept: "Cas9 Conformation Lock & R-Loop Abortion"
    }
  },
  {
    id: "econ",
    domain: "ECONOMICS : GAME THEORY",
    category: "Algorithmic Economics",
    icon: TrendingUp,
    title: "Nash Equilibrium & Iterated Strategic Matrices",
    level: "BLOOM L4 · MATHEMATICAL RIGOR",
    desc: "Analyze dominant strategies, Pareto efficiency, the Prisoner's Dilemma, and evolutionary cooperation under Tit-for-Tat.",
    formula: "uᵢ(sᵢ*, s₋ᵢ*) ≥ uᵢ(sᵢ, s₋ᵢ*)   ∀ sᵢ ∈ Sᵢ",
    prompt: "Game Theory & Economics: Nash Equilibrium, Prisoner's Dilemma Payoff Matrices, and Cooperative Strategies",
    dagNodes: [
      {
        step: "01",
        type: "FOUNDATION",
        title: "Strategic Form Games & Payoff Tensors",
        detail: "Defining action sets, utility functions, and ordinal preference rankings between agents.",
        badge: "Microeconomics"
      },
      {
        step: "02",
        type: "DERIVATION",
        title: "Best-Response Correspondence & Nash Existence",
        detail: "Kakutani fixed-point theorem and strict dominance elimination in 2×2 finite games.",
        badge: "Topology & Sets"
      },
      {
        step: "03",
        type: "SIMULATION",
        title: "Dynamic Payoff Matrix & Best-Response Lab",
        detail: "Drag payoff values in real time to observe the movement of pure and mixed-strategy equilibrium points.",
        badge: "Tensor Solver"
      },
      {
        step: "04",
        type: "SOCRATIC",
        title: "Pareto Sub-Optimality vs Rational Stability",
        detail: "Dissecting why individual rational self-interest systematically produces collectively inferior outcomes.",
        badge: "Paradox Analysis"
      }
    ],
    simulationSpec: {
      engine: "Interactive 2×2 Strategic Tensor Workbench",
      description: "Adjustable utility sliders with automatic pure & mixed-strategy Nash equilibrium solver.",
      telemetry: "STABILITY: LYAPUNOV | PAYOFF: [u₁, u₂] | ITERATIONS: 100 ROUNDS"
    },
    socraticProbe: {
      question: "Why is a Pareto-efficient outcome in a single-shot Prisoner's Dilemma fundamentally strategically unstable?",
      trapConcept: "Strict Unilateral Defection Incentive"
    }
  }
];

export default function CurriculumExplorer() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>(TRACKS[0]);
  const [activeNodeIdx, setActiveNodeIdx] = useState<number>(0);

  const handleLaunch = (prompt: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", prompt);
    }
    router.push("/studio");
  };

  return (
    <section className="pt-6 sm:pt-8 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative select-none">
      
      {/* ── Section Header ── */}
      <ScrollReveal direction="up" threshold={0.1}>
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-4 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 animate-pulse" />
            <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">PEDAGOGICAL ARCHITECTURE · STAGE 03</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-cyan-500 font-bold">DIRECTED ACYCLIC GRAPH</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
            Engineered for mastery.{" "}
            <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">
              Not passive reading.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Every LessonCrafter syllabus compiles a rigorous 4-stage cognitive graph: from intuitive anchors 
            and mathematical derivations to reactive simulators and Socratic counter-tests.
          </p>
        </div>
      </ScrollReveal>

      {/* ── Track Selector Deck (Hardware Channels) ── */}
      <ScrollReveal direction="up" delay={80} threshold={0.1}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-6">
          {TRACKS.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTrack.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  setSelectedTrack(track);
                  setActiveNodeIdx(0);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                  isSelected
                    ? "bg-white dark:bg-[#0f172a] border-cobalt-500 dark:border-cobalt-400 shadow-lg shadow-cobalt-500/10 ring-1 ring-cobalt-500/30"
                    : "bg-white/70 dark:bg-[#0c111c]/70 hover:bg-white dark:hover:bg-[#0f172a]/90 border-slate-200/90 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/[0.15]"
                }`}
              >
                {/* Active Indicator Top Accent Bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cobalt-500 via-cyan-400 to-cobalt-500" />
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-md ${isSelected ? "bg-cobalt-500/15 text-cobalt-600 dark:text-cyan-400" : "bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 tracking-wider">
                    {track.level.split("·")[0].trim()}
                  </span>
                </div>

                <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">
                  [{track.domain.split(":")[0].trim()}]
                </div>

                <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                  {track.title}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollReveal>

      {/* ── Main Curriculum Architecture Workstation ── */}
      <ScrollReveal direction="up" delay={140} threshold={0.08}>
        <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white/80 dark:bg-[#0c111c]/75 backdrop-blur-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden transition-all">
          
          {/* Chassis Top Control Strip */}
          <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-400 font-mono text-[11px] font-bold border border-cobalt-500/25">
                {selectedTrack.domain}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {selectedTrack.level}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-slate-400 text-[11px]">MASTER FORMULA:</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/[0.08] font-bold text-cobalt-600 dark:text-cyan-400 text-[11px]">
                {selectedTrack.formula}
              </span>
            </div>
          </div>

          {/* Workstation Split Body: Left Interactive DAG Node Tree | Right Engine Specs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* ════ LEFT: Interactive Syllabus DAG Node Pathway (7 Cols) ════ */}
            <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-white/[0.08] space-y-5">
              
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
                  {selectedTrack.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {selectedTrack.desc}
                </p>
              </div>

              {/* The Interactive DAG Pathway */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-cobalt-500" />
                    Cognitive Progression Pipeline (DAG)
                  </span>
                  <span className="text-cyan-400 text-[10px]">CLICK TO INSPECT NODE</span>
                </div>

                <div className="space-y-2 relative">
                  {/* Connecting Vertical Schematic Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-cobalt-500/50 via-cyan-400/40 to-emerald-500/50 pointer-events-none" />

                  {selectedTrack.dagNodes.map((node, idx) => {
                    const isActive = activeNodeIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveNodeIdx(idx)}
                        className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative z-10 flex items-start gap-3.5 ${
                          isActive
                            ? "bg-white dark:bg-[#0f172a] border-cobalt-500 dark:border-cyan-500 shadow-md ring-1 ring-cyan-500/20"
                            : "bg-slate-50/70 dark:bg-black/30 hover:bg-slate-100/80 dark:hover:bg-white/[0.04] border-slate-200/70 dark:border-white/[0.06]"
                        }`}
                      >
                        {/* Step Marker Pill */}
                        <div className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 transition-all ${
                          isActive
                            ? "bg-cobalt-600 text-white shadow-sm shadow-cobalt-500/30"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400"
                        }`}>
                          {node.step}
                        </div>

                        {/* Node Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {node.title}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 font-semibold ${
                              isActive
                                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                                : "bg-slate-200/60 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400"
                            }`}>
                              {node.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                            {node.detail}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ════ RIGHT: Laboratory Hardware Specs & Socratic Probe (5 Cols) ════ */}
            <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-5 bg-slate-50/40 dark:bg-black/20">
              
              <div className="space-y-4">
                
                {/* Parametric Simulation Engine Spec Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#0c111c] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-cobalt-600 dark:text-cyan-400">
                      <Sliders className="w-3.5 h-3.5" />
                      SIMULATION ENGINE SPEC
                    </span>
                    <span className="text-emerald-500 text-[10px] font-bold">● REACTIVE</span>
                  </div>

                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">
                    {selectedTrack.simulationSpec.engine}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedTrack.simulationSpec.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] font-mono text-[10px] text-slate-400 dark:text-slate-500">
                    {selectedTrack.simulationSpec.telemetry}
                  </div>
                </div>

                {/* Dialectical Challenge Probe Box */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#0c111c] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                      <HelpCircle className="w-3.5 h-3.5" />
                      SOCRATIC COUNTER-PROBE
                    </span>
                    <span className="text-[10px] text-slate-400">BLOOM EVAL</span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    &ldquo;{selectedTrack.socraticProbe.question}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-400">Diagnostic Target:</span>
                    <span className="text-amber-500 font-bold">{selectedTrack.socraticProbe.trapConcept}</span>
                  </div>
                </div>

                {/* Node Deep Dive Callout */}
                <div className="p-3.5 rounded-lg bg-cobalt-500/10 dark:bg-cobalt-500/10 border border-cobalt-500/20 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 text-cobalt-600 dark:text-cyan-400 font-bold mb-1">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>ACTIVE INSPECTION : STAGE {selectedTrack.dagNodes[activeNodeIdx].step}</span>
                  </div>
                  <p className="font-sans text-xs text-slate-600 dark:text-slate-400">
                    {selectedTrack.dagNodes[activeNodeIdx].title}: Verified cognitive anchor with interactive verification gates.
                  </p>
                </div>

              </div>

              {/* Action Button: Compile This Lesson in Studio */}
              <button
                type="button"
                onClick={() => handleLaunch(selectedTrack.prompt)}
                className="w-full py-3.5 px-4 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cobalt-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Compile & Launch Module in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

          {/* Bottom Chassis Verification Strip */}
          <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pedagogical scaffolding verified against revised Bloom&apos;s taxonomy (Level 4–6)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-slate-400">TOTAL NODES: <strong className="text-slate-700 dark:text-slate-300">4 STAGES</strong></span>
              <span className="text-slate-400">EVAL: <strong className="text-emerald-500">FIRST-PRINCIPLES</strong></span>
            </div>
          </div>

        </div>
      </ScrollReveal>

    </section>
  );
}
