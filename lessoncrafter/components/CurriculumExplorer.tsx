"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Atom, 
  Binary, 
  Dna, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Sliders, 
  HelpCircle 
} from "lucide-react";

interface CurriculumTrack {
  id: string;
  category: string;
  icon: any;
  title: string;
  level: string;
  desc: string;
  prompt: string;
  sections: string[];
  simulationSpec: string;
  sampleQuestion: string;
}

const TRACKS: CurriculumTrack[] = [
  {
    id: "quantum",
    category: "Modern Physics",
    icon: Atom,
    title: "Quantum Entanglement & State Vectors",
    level: "College / Advanced",
    desc: "Derive Bell states, Pauli spin matrices, and measure state collapse with interactive Bloch sphere projections.",
    prompt: "Quantum Computing: Entanglement, Bell Inequalities & Superposition with interactive spin measurement and state vector visualization",
    sections: [
      "Quantum Superposition & Dirac Bra-Ket Notation",
      "Bell State Generation & Entangled Pairs",
      "Measurement Collapse & EPR Paradox",
      "Quantum Teleportation & Cryptographic Key Distribution",
    ],
    simulationSpec: "Interactive Bloch Sphere with theta/phi rotation sliders and real-time probabilistic collapse readout.",
    sampleQuestion: "Why does measuring Qubit A instantaneously determine Qubit B without violating relativistic causality?",
  },
  {
    id: "ml",
    category: "Computer Science",
    icon: Binary,
    title: "Transformer Attention & Multi-Head Self-Attention",
    level: "High School / College",
    desc: "Deconstruct Query, Key, and Value matrices, scaled dot-product attention, and positional encodings.",
    prompt: "Transformers & Deep Learning: Multi-Head Self-Attention Mechanism, Query-Key-Value Dot Products, and Softmax Temperature",
    sections: [
      "The Bottleneck of RNNs & The Attention Breakthrough",
      "Mathematical Mechanics: Q, K, V Projections",
      "Softmax Temperature Scaling & Attention Maps",
      "Multi-Head Parallel Representation & Residual Connections",
    ],
    simulationSpec: "Interactive Heatmap Visualizer displaying live Q·K^T dot product matrix and adjustable Softmax temperature slider.",
    sampleQuestion: "What is the mathematical reason for dividing the Q·K dot product by the square root of d_k?",
  },
  {
    id: "bio",
    category: "Cellular Biology",
    icon: Dna,
    title: "CRISPR-Cas9 Gene Editing & DNA Cleavage",
    level: "High School / College",
    desc: "Explore guide RNA matching, PAM sequence recognition, double-strand breaks, and homology-directed repair.",
    prompt: "Cellular Genetics: CRISPR-Cas9 Molecular Mechanism, Guide RNA Targeting, and Non-Homologous End Joining",
    sections: [
      "Bacterial Adaptive Immunity & Cas9 Endonuclease",
      "Guide RNA Synthesis & PAM (NGG) Recognition",
      "Double-Strand Cleavage at the Target Locus",
      "Cellular Repair Pathways: NHEJ vs Homology-Directed Repair",
    ],
    simulationSpec: "Interactive DNA Strand viewer with guide RNA matching slider and mutation repair pathway selector.",
    sampleQuestion: "What consequence occurs if the PAM sequence (NGG) is mutated in the target genomic DNA?",
  },
  {
    id: "econ",
    category: "Macroeconomics",
    icon: TrendingUp,
    title: "Game Theory: Nash Equilibrium & Payoff Matrices",
    level: "Undergraduate",
    desc: "Analyze dominant strategies, Pareto efficiency, Prisoner's Dilemma, and repeated games with Tit-for-Tat.",
    prompt: "Game Theory & Economics: Nash Equilibrium, Prisoner's Dilemma Payoff Matrices, and Cooperative Strategies",
    sections: [
      "Strategic Games & Strategic Dominance",
      "Solving The Prisoner's Dilemma with Payoff Matrices",
      "Pareto Optimality vs Nash Equilibrium",
      "Iterated Games & The Tit-for-Tat Dynamic",
    ],
    simulationSpec: "Interactive 2x2 Payoff Matrix with adjustable reward sliders and automated Nash equilibrium finder.",
    sampleQuestion: "Why is the Nash equilibrium in a single-round Prisoner's Dilemma sub-optimal for both players?",
  },
];

export default function CurriculumExplorer() {
  const router = useRouter();
  const [selectedTrack, setSelectedTrack] = useState<CurriculumTrack>(TRACKS[0]);

  const handleLaunch = (prompt: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pending_prompt", prompt);
    }
    router.push("/studio");
  };

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
          <BookOpen className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
          <span className="text-xs font-mono font-bold text-cobalt-700 dark:text-cobalt-300 uppercase tracking-widest">
            Curriculum Blueprints
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Explore Ready-to-Synthesize Curriculum Tracks
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
          Select any domain below to preview the architectural structure synthesized by our multi-agent pipeline. Launch any blueprint with a single click.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TRACKS.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTrack.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-cobalt-600 text-white shadow-xl shadow-cobalt-600/25 ring-2 ring-cobalt-400/40"
                  : "bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-cobalt-400/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? "text-white" : "text-cobalt-600 dark:text-cobalt-400"}`} />
                <span className={`text-[10px] font-mono font-bold uppercase ${isSelected ? "text-cobalt-100" : "text-slate-400"}`}>
                  {t.category}
                </span>
              </div>
              <div className="font-bold text-sm truncate">{t.title}</div>
            </button>
          );
        })}
      </div>

      {/* Track Detailed Preview Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border-slate-200 dark:border-white/10 shadow-2xl bg-card text-card-foreground grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Lesson Outline & Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/20">
                {selectedTrack.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                {selectedTrack.level}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {selectedTrack.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {selectedTrack.desc}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cobalt-500" />
              Synthesized Theoretical Curriculum (4 Sections)
            </h4>
            <div className="space-y-2.5">
              {selectedTrack.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-cobalt-600/10 text-cobalt-600 dark:text-cobalt-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span className="font-semibold">{sec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulation & Formative Spec (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-slate-200 dark:lg:border-white/10 lg:pl-8">
          
          <div className="space-y-5">
            {/* Simulation Preview */}
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider mb-2">
                <Sliders className="w-4 h-4 text-marine-500" />
                <span>Interactive Simulation Spec</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTrack.simulationSpec}
              </p>
            </div>

            {/* Calibrated Question Preview */}
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-solar-600 dark:text-solar-400 uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4 text-solar-500" />
                <span>Sample Calibrated Check</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                &ldquo;{selectedTrack.sampleQuestion}&rdquo;
              </p>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={() => handleLaunch(selectedTrack.prompt)}
            className="w-full py-4 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-cobalt-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>Synthesize This Blueprint in Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>

      </div>

    </section>
  );
}
