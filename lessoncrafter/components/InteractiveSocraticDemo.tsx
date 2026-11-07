"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare
} from "lucide-react";

interface QAPair {
  q: string;
  topic: string;
  tutorReply: string;
  guidingQuestion: string;
}

const DEMO_QUESTIONS: QAPair[] = [
  {
    q: "Why doesn't the moon fall into the Earth if gravity is always pulling it inward?",
    topic: "Orbital Mechanics",
    tutorReply: "Imagine firing a cannon horizontally from a high mountain. With low velocity, it falls to the ground. What happens as you fire it faster and faster?",
    guidingQuestion: "At what speed does the curve of the cannonball's fall match the curvature of the Earth dropping away beneath it?",
  },
  {
    q: "In wave interference, where does the energy go during destructive interference?",
    topic: "Wave Physics",
    tutorReply: "Energy can never be destroyed. When two opposite wave crests meet and cancel out to zero in one spot, look at the neighboring areas where crests double.",
    guidingQuestion: "Is the energy gone, or has it moved to the brighter constructive regions?",
  },
  {
    q: "Why do neural networks need non-linear functions like ReLU?",
    topic: "Machine Learning",
    tutorReply: "Consider multiplying two linear equations: y = W₁(W₂x). Notice that W₁ × W₂ is still just one single linear matrix. If you stack 100 linear layers, what can the model actually learn?",
    guidingQuestion: "Can a purely linear line ever separate data that forms a circle or curve?",
  },
];

export default function InteractiveSocraticDemo() {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeQA = DEMO_QUESTIONS[selectedIdx];

  return (
    <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto">
      
      <div className="bg-white dark:bg-slate-900/70 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Clear Value Prop (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <MessageSquare className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
            <span>Interactive Study Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            An assistant that helps you <span className="text-gradient">actually understand</span>
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Instead of simply giving away final answers, the built-in assistant guides your thinking with helpful hints, physical analogies, and step-by-step logic.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Explains concepts from first principles</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Gives hints without spoiling test questions</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Helps you explore and test hypotheses</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => router.push("/studio")}
              className="px-5 py-3 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-cobalt-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Build a Custom Lesson</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Chat Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Question Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
            {DEMO_QUESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedIdx === idx
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {item.topic}
              </button>
            ))}
          </div>

          {/* Chat Window Frame */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-4">
            
            {/* User Question Bubble */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-sm bg-cobalt-600 text-white text-xs leading-relaxed font-medium shadow-sm">
                {activeQA.q}
              </div>
            </div>

            {/* Assistant Guiding Response */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0 border border-cobalt-500/20">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="space-y-2.5 max-w-[90%]">
                <div className="p-3.5 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal shadow-sm">
                  {activeQA.tutorReply}
                </div>
                
                {/* Guiding Question Prompt */}
                <div className="p-3 rounded-xl bg-cobalt-500/5 dark:bg-cobalt-500/10 border-l-3 border-cobalt-500 text-[11px] text-cobalt-800 dark:text-cobalt-300 font-medium">
                  <span className="font-bold">Next thought: </span>
                  {activeQA.guidingQuestion}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
