"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Atom, 
  Binary, 
  Dna, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  Sliders, 
  HelpCircle,
  Compass
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
    category: "Physics",
    icon: Atom,
    title: "Quantum Entanglement & Bell States",
    level: "College Undergrad",
    desc: "Derive Bell states, Pauli spin matrices, and measure state collapse with interactive spin projection visualizers.",
    prompt: "Quantum Computing: Entanglement, Bell Inequalities & Superposition with interactive spin measurement and state vector visualization",
    sections: [
      "Quantum Superposition & Dirac Notation",
      "Bell State Generation & Entangled Pairs",
      "Measurement Collapse & The EPR Paradox",
      "Quantum Teleportation & Cryptographic Keys",
    ],
    simulationSpec: "Interactive Bloch Sphere with rotation sliders and real-time state collapse probability readout.",
    sampleQuestion: "Why does measuring Qubit A instantaneously determine Qubit B without violating the speed of light?",
  },
  {
    id: "ml",
    category: "Computer Science",
    icon: Binary,
    title: "Transformer Attention & Q/K/V Matrices",
    level: "Intermediate",
    desc: "Deconstruct Query, Key, and Value matrices, scaled dot-product attention, and multi-head mechanisms.",
    prompt: "Transformers & Deep Learning: Multi-Head Self-Attention Mechanism, Query-Key-Value Dot Products, and Softmax Temperature",
    sections: [
      "The Bottleneck of RNNs & The Attention Breakthrough",
      "Matrix Mechanics: Query, Key, and Value Projections",
      "Softmax Temperature Scaling & Attention Maps",
      "Multi-Head Parallel Representation & Residual Connections",
    ],
    simulationSpec: "Interactive Heatmap Visualizer displaying live Q·K^T dot product matrix and adjustable Softmax temperature slider.",
    sampleQuestion: "What is the mathematical reason for dividing the Q·K dot product by the square root of d_k?",
  },
  {
    id: "bio",
    category: "Biology",
    icon: Dna,
    title: "CRISPR-Cas9 Gene Editing Mechanism",
    level: "High School / College",
    desc: "Explore guide RNA matching, PAM sequence recognition, double-strand breaks, and cellular repair pathways.",
    prompt: "Cellular Genetics: CRISPR-Cas9 Molecular Mechanism, Guide RNA Targeting, and Non-Homologous End Joining",
    sections: [
      "Bacterial Immunity & Cas9 Endonuclease",
      "Guide RNA Matching & PAM (NGG) Recognition",
      "Double-Strand DNA Cleavage at the Target Locus",
      "Cellular Repair: NHEJ vs Homology-Directed Repair",
    ],
    simulationSpec: "Interactive DNA strand viewer with guide RNA matching slider and repair pathway selector.",
    sampleQuestion: "What consequence occurs if the PAM sequence (NGG) is mutated in the target genomic DNA?",
  },
  {
    id: "econ",
    category: "Economics",
    icon: TrendingUp,
    title: "Game Theory: Nash Equilibrium & Payoffs",
    level: "Undergraduate",
    desc: "Analyze dominant strategies, Pareto efficiency, the Prisoner's Dilemma, and repeated games with Tit-for-Tat.",
    prompt: "Game Theory & Economics: Nash Equilibrium, Prisoner's Dilemma Payoff Matrices, and Cooperative Strategies",
    sections: [
      "Strategic Games & Dominant Strategies",
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
    <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
          <Compass className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
          <span>Featured Topics</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Explore Interactive Lessons
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
          Preview how LessonCrafter turns complex topics into interactive parameter simulators, structured modules, and practice quizzes.
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {TRACKS.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTrack.id === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/20"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cobalt-400/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-cobalt-600 dark:text-cobalt-400"}`} />
                <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-cobalt-100" : "text-slate-400"}`}>
                  {t.category}
                </span>
              </div>
              <div className="font-bold text-xs truncate">{t.title}</div>
            </button>
          );
        })}
      </div>

      {/* Track Detailed Preview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Lesson Outline & Sections (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/20">
                {selectedTrack.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {selectedTrack.level}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {selectedTrack.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {selectedTrack.desc}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cobalt-500" />
              <span>What this lesson covers</span>
            </h4>
            <div className="space-y-2">
              {selectedTrack.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  <span className="w-5 h-5 rounded-md bg-cobalt-600/10 text-cobalt-600 dark:text-cobalt-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{sec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Simulation & Question (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5 lg:border-l lg:border-slate-100 dark:lg:border-slate-800 lg:pl-8">
          
          <div className="space-y-4">
            {/* Simulation Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cobalt-600 dark:text-cobalt-400 mb-1.5">
                <Sliders className="w-4 h-4" />
                <span>Interactive Simulator Included</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {selectedTrack.simulationSpec}
              </p>
            </div>

            {/* Practice Question Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>Sample Practice Question</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">
                &ldquo;{selectedTrack.sampleQuestion}&rdquo;
              </p>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={() => handleLaunch(selectedTrack.prompt)}
            className="w-full py-3.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-cobalt-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Build This Lesson</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>
    </section>
  );
}
