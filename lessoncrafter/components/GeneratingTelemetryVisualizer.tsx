"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  Code2, 
  Sparkles, 
  Zap, 
  Paintbrush, 
  Terminal, 
  Cpu, 
  Lightbulb, 
  Check, 
  Clock 
} from "lucide-react";

export type AgentStatus = "waiting" | "running" | "done" | "error";

export interface PipelineProgress {
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

const AGENTS = [
  {
    key: "content",
    name: "Content Architect",
    model: "Gemini 2.5",
    role: "Scaffolding & Concepts",
    icon: Brain,
  },
  {
    key: "interactive",
    name: "Interactive Engineer",
    model: "Gemini 2.5",
    role: "Simulation Modeling",
    icon: Code2,
  },
  {
    key: "quiz",
    name: "Formative Evaluator",
    model: "Groq OSS-120B",
    role: "Misconception Calibration",
    icon: Zap,
  },
  {
    key: "compiler",
    name: "TSX Synthesizer",
    model: "AST Compiler",
    role: "React-Live Assembly",
    icon: Cpu,
  },
  {
    key: "polish",
    name: "UI Polish Specialist",
    model: "Design System",
    role: "Dual-Mode Styling",
    icon: Paintbrush,
  },
];

const PEDAGOGICAL_FACTS = [
  "Interactive simulations boost conceptual retention by up to 600% compared to static reading.",
  "Groq OSS-120B is calibrating 4-choice distractors specifically designed to identify cognitive misconceptions.",
  "Your generated lesson will seamlessly adapt between Dark Mode (#0a0f18) and Light Mode (#f8fafc).",
  "The dual-column layout pairs deep narrative explanation with an executable parameter sandbox.",
  "All interactive state machines run 100% client-side with zero latency and sandbox safety locks.",
  "Formative micro-quizzes immediately reinforce cognitive connections while concepts are fresh.",
];

export default function GeneratingTelemetryVisualizer({
  pipeline,
  topicTitle,
}: GeneratingTelemetryVisualizerProps) {
  const [factIndex, setFactIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    "INITIALIZING: Spawning multi-agent neural orchestrator...",
    "DISPATCH: Content Architect synthesizing pedagogical curriculum...",
  ]);

  // Rotate educational insights every 3.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % PEDAGOGICAL_FACTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically populate live telemetry log feed based on pipeline status
  useEffect(() => {
    if (!pipeline) return;

    const newLogs: string[] = [
      "INITIALIZING: Neural multi-agent cluster online.",
    ];

    if (pipeline.content === "running") {
      newLogs.push("AGENT 1 [Content Architect]: Formulating conceptual breakdown and objectives...");
    } else if (pipeline.content === "done") {
      newLogs.push("AGENT 1 [Content Architect]: Completed structured curriculum sections.");
    }

    if (pipeline.interactive === "running" || pipeline.quiz === "running") {
      newLogs.push("PARALLEL DISPATCH: Spawning Interactive Engineer & Groq 120B Formative Evaluator concurrently.");
    }

    if (pipeline.interactive === "running") {
      newLogs.push("AGENT 2 [Interactive Engineer]: Designing dynamic parameter sliders and stateful canvas...");
    } else if (pipeline.interactive === "done") {
      newLogs.push("AGENT 2 [Interactive Engineer]: Interactive simulation module ready.");
    }

    if (pipeline.quiz === "running") {
      newLogs.push("AGENT 3 [Quiz Evaluator (Groq 120B)]: Generating 5 formative questions with deep reasoning...");
    } else if (pipeline.quiz === "done") {
      newLogs.push("AGENT 3 [Quiz Evaluator (Groq 120B)]: Formative assessment questions verified.");
    }

    if (pipeline.compiler === "running") {
      newLogs.push("AGENT 4 [TSX Synthesizer]: Compiling 2-column layout into self-contained LessonComponent...");
    } else if (pipeline.compiler === "done") {
      newLogs.push("AGENT 4 [TSX Synthesizer]: Validated react-live AST with zero compile errors.");
    }

    if (pipeline.polish === "running") {
      newLogs.push("AGENT 5 [UI Polish Specialist]: Applying Pantone Cobalt Architect Dual-Mode tokens...");
    } else if (pipeline.polish === "done") {
      newLogs.push("PIPELINE COMPLETE: Finalizing artifacts for immediate browser execution.");
    }

    setLogs(newLogs);
  }, [pipeline]);

  // Calculate overall percentage
  const calculateProgressPercent = () => {
    if (!pipeline) return 10;
    let score = 0;
    if (pipeline.content === "done") score += 25;
    else if (pipeline.content === "running") score += 12;

    if (pipeline.interactive === "done") score += 20;
    else if (pipeline.interactive === "running") score += 10;

    if (pipeline.quiz === "done") score += 20;
    else if (pipeline.quiz === "running") score += 10;

    if (pipeline.compiler === "done") score += 20;
    else if (pipeline.compiler === "running") score += 10;

    if (pipeline.polish === "done") score += 15;
    else if (pipeline.polish === "running") score += 7;

    return Math.min(Math.max(score, 12), 98);
  };

  const progressPercent = calculateProgressPercent();

  return (
    <div className="w-full glass-card p-6 sm:p-8 rounded-3xl border-cobalt-500/30 bg-gradient-to-b from-cobalt-500/10 via-slate-900/60 to-slate-950/80 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      
      {/* Ambient Animated Glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-cobalt-500/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-marine-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200/20 dark:border-white/10 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-cobalt-600 text-white flex items-center justify-center shadow-lg shadow-cobalt-600/30">
              <Sparkles className="w-6 h-6 animate-spin text-white" style={{ animationDuration: "6s" }} />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Neural Generation Pipeline
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cobalt-500/20 text-cobalt-600 dark:text-cobalt-300 border border-cobalt-500/30">
                Live Orchestration
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate max-w-md">
              Synthesizing: <span className="font-semibold text-slate-800 dark:text-slate-200 italic">&ldquo;{topicTitle || "Interactive Curriculum"}&rdquo;</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cobalt-500" />
            <span>{elapsedSeconds}s</span>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-black text-cobalt-600 dark:text-cobalt-400">
              {progressPercent}% Complete
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              5 Neural Agents
            </div>
          </div>
        </div>
      </div>

      {/* Animated Gradient Progress Shimmer */}
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden mb-8 relative">
        <div 
          className="h-full bg-gradient-to-r from-cobalt-600 via-marine-500 to-emerald-400 transition-all duration-700 ease-out rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/25 animate-shimmer" />
        </div>
      </div>

      {/* Multi-Agent Node Visualizer Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 mb-8 relative z-10">
        {AGENTS.map((agent, i) => {
          const status = pipeline ? (pipeline[agent.key as keyof PipelineProgress] || "waiting") : "waiting";
          const Icon = agent.icon;
          const isRunning = status === "running";
          const isDone = status === "done";

          return (
            <div
              key={agent.key}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative ${
                isRunning
                  ? "bg-cobalt-500/15 border-cobalt-500 shadow-lg shadow-cobalt-500/20 ring-2 ring-cobalt-400/40"
                  : isDone
                  ? "bg-emerald-500/10 border-emerald-500/30 text-slate-800 dark:text-slate-200"
                  : "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    isRunning
                      ? "bg-cobalt-600 text-white animate-bounce shadow-md shadow-cobalt-600/30"
                      : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 dark:bg-white/5 text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {isDone ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                ) : isRunning ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-cobalt-500 animate-ping" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">0{i + 1}</span>
                )}
              </div>

              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {agent.name}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  {agent.role}
                </div>
                <div className="mt-2 text-[9px] font-mono font-bold uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400">
                  {agent.model}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Telemetry Terminal Logs & Insight Pill */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative z-10">
        
        {/* Terminal Logs Box */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cobalt-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Agent Telemetry</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
            {logs.slice(-4).map((line, idx) => (
              <div key={idx} className="text-[11px] text-slate-300 leading-tight flex items-start gap-1.5">
                <span className="text-cobalt-400 font-bold">&gt;</span>
                <span className={idx === logs.slice(-4).length - 1 ? "text-white font-semibold animate-pulse" : "text-slate-400"}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rotating Educational Insight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100/90 to-slate-200/50 dark:from-slate-900/80 dark:to-slate-950/90 border border-slate-200 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-cobalt-600 dark:text-cobalt-400 uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4 text-solar-500 animate-bounce" />
            <span>Pedagogical Principle</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium transition-all duration-300 min-h-[44px]">
            &ldquo;{PEDAGOGICAL_FACTS[factIndex]}&rdquo;
          </p>
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2">
            <span>LessonCrafter AI Orchestration</span>
            <span>Refreshes dynamically</span>
          </div>
        </div>

      </div>

    </div>
  );
}
