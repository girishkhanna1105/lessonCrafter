"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Lightbulb, 
  BrainCircuit, 
  HelpCircle 
} from "lucide-react";

interface QAPair {
  q: string;
  topic: string;
  tutorReply: string;
  guidingQuestion: string;
}

const DEMO_QUESTIONS: QAPair[] = [
  {
    q: "Why doesn't the moon crash into Earth if gravity is always pulling it inward?",
    topic: "Orbital Mechanics",
    tutorReply: "Imagine firing a cannon horizontally from a high mountaintop. If you fire with low velocity, it arcs and hits the ground. What happens as you increase the muzzle velocity higher and higher?",
    guidingQuestion: "At what point does the curvature of the projectile's trajectory match the curvature of the Earth's surface falling away beneath it?",
  },
  {
    q: "In wave interference, where does the energy go during destructive interference?",
    topic: "Wave Physics",
    tutorReply: "Energy cannot be destroyed by the law of conservation. When two opposite wave crests meet and momentarily cancel out to zero displacement, notice where the neighboring constructive crests have doubled.",
    guidingQuestion: "Is the energy destroyed, or is it redistributed elsewhere in the interference spatial pattern?",
  },
  {
    q: "Why do neural networks need non-linear activations like ReLU or Sigmoid?",
    topic: "Deep Learning",
    tutorReply: "Consider multiplying two linear equations: y = W₁(W₂x). Notice that W₁ × W₂ simply collapses into a single matrix W₃. If every layer in a 100-layer network is purely linear, what is the effective depth of the model?",
    guidingQuestion: "Can a purely linear system learn to draw a curved decision boundary around data?",
  },
];

export default function InteractiveSocraticDemo() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeQA = DEMO_QUESTIONS[selectedIdx];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* Container */}
      <div className="glass-card rounded-3xl p-6 sm:p-12 border-slate-200 dark:border-white/10 shadow-2xl bg-gradient-to-br from-card via-card to-cobalt-500/5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Pedagogical Value Prop (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass">
            <BrainCircuit className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-cobalt-700 dark:text-cobalt-300 uppercase tracking-widest">
              Socratic Pedagogical Sidecar
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            An AI Mentor That Teaches You <span className="text-gradient">How to Think</span>
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Unlike generic chatbots that leak immediate answers and short-circuit the learning process, LessonCrafter&apos;s embedded Socratic Tutor guides students through cognitive scaffolding, intuitive physical analogies, and targeted counter-questions.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>Identifies and corrects underlying mental misconceptions</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>Context-aware of the active lesson simulation and quiz state</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
              <span>Powered by Groq OSS-120B reasoning engine</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => router.push("/studio")}
              className="px-6 py-3.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cobalt-600/25 flex items-center gap-2 transition-all active:scale-95 group cursor-pointer"
            >
              <span>Try Socratic Tutor in Creation Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Chat Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
          
          {/* Top Question Chips */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-3">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cobalt-400" />
                <span>SELECT A SAMPLE LEARNER INQUIRY:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">● Active Sandbox</span>
            </div>

            <div className="space-y-2">
              {DEMO_QUESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                    selectedIdx === idx
                      ? "bg-cobalt-950/80 border-cobalt-500 text-white shadow-md ring-1 ring-cobalt-400/30"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  <span className="font-semibold truncate pr-2">&ldquo;{item.q}&rdquo;</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cobalt-300 flex-shrink-0">
                    {item.topic}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Dialogue Thread */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            
            {/* Student Message */}
            <div className="flex gap-3 justify-end items-start text-xs">
              <div className="bg-cobalt-600 text-white p-3.5 rounded-2xl rounded-tr-none max-w-[85%] shadow-md leading-relaxed">
                {activeQA.q}
              </div>
            </div>

            {/* Socratic Tutor Response */}
            <div className="flex gap-3 justify-start items-start text-xs animate-in fade-in duration-300">
              <div className="w-8 h-8 rounded-xl bg-cobalt-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-cobalt-600/30">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-[90%] space-y-3 leading-relaxed shadow-sm">
                <p>{activeQA.tutorReply}</p>
                <div className="p-3 rounded-xl bg-cobalt-950/70 border border-cobalt-500/30 text-cobalt-200 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-solar-400 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-[11px]">{activeQA.guidingQuestion}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                  <span>Socratic Scaffolding Mode</span>
                  <span className="text-emerald-400">Response generated in 180ms</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
