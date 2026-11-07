"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  Code2, 
  Sliders, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Check, 
  Clock 
} from "lucide-react";

export type AgentStatus = "waiting" | "running" | "done" | "error";

export interface PipelineProgress {
  pedagogy?: AgentStatus;
  content: AgentStatus;
  interactive: AgentStatus;
  quiz: AgentStatus;
  compiler: AgentStatus;
  polish: AgentStatus;
}

interface GeneratingTelemetryVisualizerProps {
  pipeline: PipelineProgress | null;
  topicTitle?: string;
}

const STEPS = [
  {
    key: "pedagogy",
    name: "Curriculum Planning",
    desc: "Structuring concepts & mental models",
    icon: BookOpen,
  },
  {
    key: "content",
    name: "Deep Explanations",
    desc: "Writing first-principles modules",
    icon: FileText,
  },
  {
    key: "interactive",
    name: "Interactive Simulator",
    desc: "Crafting real-time visual sandbox",
    icon: Sliders,
  },
  {
    key: "quiz",
    name: "Practice & Solutions",
    desc: "Writing formative review questions",
    icon: CheckCircle2,
  },
  {
    key: "compiler",
    name: "Lesson Assembly",
    desc: "Connecting interactive state & layouts",
    icon: Code2,
  },
];

const HELPFUL_TIPS = [
  "Tip: Moving the parameter sliders in the interactive lab helps build physical intuition faster than passive reading.",
  "Tip: You can switch between Interactive Mode and Executive Document view anytime for printing or saving a PDF.",
  "Tip: Every lesson includes a worked problem with step-by-step mathematical or logical steps.",
  "Tip: You can ask the built-in study assistant questions anytime if you want a hint or alternative explanation.",
];

export default function GeneratingTelemetryVisualizer({
  pipeline,
  topicTitle,
}: GeneratingTelemetryVisualizerProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rotate helpful tips every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % HELPFUL_TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate overall percentage
  const stepKeys: (keyof PipelineProgress)[] = ["pedagogy", "content", "interactive", "quiz", "compiler"];
  let completedCount = 0;
  stepKeys.forEach((k) => {
    if (pipeline && pipeline[k] === "done") completedCount++;
  });
  const progressPercent = Math.min(100, Math.round((completedCount / stepKeys.length) * 100));

  return (
    <div className="w-full max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      
      {/* Top Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cobalt-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400">
              Building Your Lesson
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
            {topicTitle || "Custom Lesson"}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 self-start sm:self-auto">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{elapsedSeconds}s elapsed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
          <span>Overall Progress</span>
          <span className="font-mono text-cobalt-600 dark:text-cobalt-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cobalt-600 to-marine-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {STEPS.map((step) => {
          const status = pipeline ? (pipeline as any)[step.key] || "waiting" : "waiting";
          const isDone = status === "done";
          const isRunning = status === "running";
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/20 text-slate-800 dark:text-slate-200"
                  : isRunning
                  ? "bg-cobalt-500/10 border-cobalt-500/40 text-slate-900 dark:text-white ring-1 ring-cobalt-500/20"
                  : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800 text-slate-400"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isDone
                  ? "bg-emerald-500 text-white"
                  : isRunning
                  ? "bg-cobalt-600 text-white animate-pulse"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              }`}>
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate">
                  {step.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {step.desc}
                </div>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider">
                {isDone ? (
                  <span className="text-emerald-500">Ready</span>
                ) : isRunning ? (
                  <span className="text-cobalt-500 animate-pulse">In Progress</span>
                ) : (
                  <span className="text-slate-400">Waiting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotating Helpful Tip Card */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cobalt-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {HELPFUL_TIPS[tipIndex]}
        </p>
      </div>

    </div>
  );
}
