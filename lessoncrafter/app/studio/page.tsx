"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Clock, CheckCircle2, AlertCircle, Loader2, BookOpen, 
  ChevronRight, Sparkles, Zap, Brain, Code2, Paintbrush, 
  Sliders, ArrowRight, Lightbulb
} from "lucide-react";
import Navbar from "@/components/Navbar";

type AgentStatus = "waiting" | "running" | "done" | "error";

interface PipelineProgress {
  content: AgentStatus;
  interactive: AgentStatus;
  quiz: AgentStatus;
  compiler: AgentStatus;
  polish: AgentStatus;
}

const AGENTS = [
  { key: "content", label: "Content Architect", provider: "Gemini 2.5", icon: Brain, desc: "Syllabus mapping & conceptual foundation" },
  { key: "interactive", label: "Interactive Builder", provider: "Gemini 2.5", icon: Zap, desc: "Dynamic sandbox simulators & widgets" },
  { key: "quiz", label: "Quiz Designer", provider: "Groq OSS-120B", icon: Sparkles, desc: "Calibrated formative checks & distractors" },
  { key: "compiler", label: "Compiler Engine", provider: "Gemini 2.5", icon: Code2, desc: "Self-contained component assembly" },
  { key: "polish", label: "UI Polish Specialist", provider: "Gemini 2.5", icon: Paintbrush, desc: "Design tokens & WCAG AAA styling" },
] as const;

const LEARNER_LEVELS = [
  { id: "elementary", label: "Elementary", tag: "Grades 1–5", desc: "Visual, tangible, story-based" },
  { id: "high_school", label: "High School", tag: "AP / IB Level", desc: "Foundational theory & practice" },
  { id: "college", label: "College / Undergrad", tag: "Advanced STEM", desc: "Rigorous math & deep derivation" },
  { id: "professional", label: "Professional", tag: "Industry R&D", desc: "Executive applied problem solving" },
];

const PEDAGOGICAL_TEMPLATES = [
  { title: "Socratic Seminar", desc: "Dialectical inquiry & guided concept prompts", prompt: "Socratic exploration of Heisenberg Uncertainty Principle with photon diffraction thought experiments" },
  { title: "Interactive Virtual Lab", desc: "Hands-on parameter simulator with real-time feedback", prompt: "Interactive Simulation of Population Genetics and Hardy-Weinberg Equilibrium with slider alleles" },
  { title: "Micro-Lesson Sprint", desc: "10-minute focused conceptual sprint + flash quiz", prompt: "Demystifying Hash Tables and Collision Resolution Algorithms in 10 minutes" },
  { title: "Diagnostic Mastery", desc: "Misconception testing with targeted remedy loops", prompt: "Calculus Optimization Problems: Maxima, Minima, and Constraint Derivatives with geometric visualizer" },
];

export default function StudioPage() {
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("college");
  const [deliveryMode, setDeliveryMode] = useState<"student" | "teacher">("student");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pipeline, setPipeline] = useState<PipelineProgress | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      router.push("/auth");
      return;
    }
    try {
      const u = JSON.parse(storedUser);
      setUser(u);
      fetch(`/api/profile?userId=${u.id}&role=${u.role || 'student'}`)
        .then(r => r.json())
        .then(d => { if (d.profile) setUserProfile(d.profile); });
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
    
    const pendingPrompt = localStorage.getItem("pending_prompt");
    if (pendingPrompt) {
      setOutline(pendingPrompt);
      localStorage.removeItem("pending_prompt");
    }
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const u = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
      let query = supabase.from("lessons").select("*");
      if (u && u.id) query = query.eq("user_id", u.id);
      const { data, error } = await query.order("created_at", { ascending: false }).limit(8);
      if (!error && data) setLessons(data);
    } catch (e) {
      console.error("Fetch lessons failed:", e);
    }
  };

  const handleSynthesize = async () => {
    if (!outline.trim()) return;
    setLoading(true);
    setPipeline({
      content: "waiting",
      interactive: "waiting",
      quiz: "waiting",
      compiler: "waiting",
      polish: "waiting",
    });

    try {
      const fullTopicPrompt = `[Target Level: ${selectedLevel}] [Mode: ${deliveryMode === "teacher" ? "Curriculum Lesson Plan" : "Student Self-Study"}] ${outline.trim()}`;

      const response = await fetch("/api/generate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: fullTopicPrompt,
          userId: user?.id || null,
          userProfile: {
            ...userProfile,
            learner_level: selectedLevel,
            role: deliveryMode,
          },
          isPublic,
        }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace("data: ", ""));

            if (json.type === "progress") {
              setPipeline({ ...json.progress });
            } else if (json.type === "done") {
              setLoading(false);
              setPipeline(null);
              router.push(`/lessons/${json.lessonId}`);
              return;
            } else if (json.type === "error") {
              console.error("Pipeline error:", json.message);
              setLoading(false);
              setPipeline(null);
              alert("Generation failed: " + json.message);
              return;
            }
          } catch {
            // Non-JSON SSE line or status frame
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Generation error:", err);
      setLoading(false);
      setPipeline(null);
      alert("Error: " + msg);
    }
  };

  const getAgentStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case "done":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-jade-500/10 text-jade-500 border border-jade-500/20">
            <CheckCircle2 className="w-3 h-3" /> Complete
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/30 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Active
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800">
            Queued
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        
        {/* Workspace Title & Telemetry Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              AI Lesson Workbench v2.5
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Creation <span className="text-gradient">Studio</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Synthesize interactive, executable micro-lessons with structured theory, visualizers, and strict formative quizzes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/lessons")}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 bg-white dark:bg-slate-900/50 transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-cobalt-500" />
              Lesson Archive
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* --- MAIN CREATION WORKBENCH (8 cols) --- */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Prompt Desk Card */}
            <div className="glass-card p-6 sm:p-8 relative">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Curriculum Topic & Pedagogical Objective
              </label>
              
              <div className="relative">
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="e.g. Quantum Computing: Entanglement & Superposition with interactive spin measurement and state vector visualization..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500/40 focus:border-cobalt-500 font-sans text-sm sm:text-base resize-none transition-all"
                />
              </div>

              {/* Target Learner Level Selector */}
              <div className="mt-6">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cobalt-500" />
                  Target Learner Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LEARNER_LEVELS.map((level) => {
                    const isSelected = selectedLevel === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => setSelectedLevel(level.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-cobalt-500/10 border-cobalt-500 text-cobalt-600 dark:text-cobalt-300 shadow-sm"
                            : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="font-bold text-xs">{level.label}</div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{level.tag}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Persona Mode Switch */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Delivery Persona:</span>
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("student")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        deliveryMode === "student"
                          ? "bg-cobalt-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      Student Self-Study
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryMode("teacher")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        deliveryMode === "teacher"
                          ? "bg-cobalt-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      }`}
                    >
                      Teacher Lesson Plan
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-cobalt-600 focus:ring-cobalt-500"
                    />
                    <span>Publish to Community Archive</span>
                  </label>
                </div>
              </div>

              {/* Primary Call-to-Action */}
              <div className="mt-8">
                <button
                  onClick={handleSynthesize}
                  disabled={loading || !outline.trim()}
                  className="w-full py-4 rounded-xl font-black text-white text-sm uppercase tracking-wider bg-gradient-to-r from-cobalt-600 via-cobalt-500 to-marine-600 hover:from-cobalt-500 hover:to-marine-500 transition-all shadow-xl shadow-cobalt-600/25 flex items-center justify-center gap-2.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Orchestrating Pipeline Agents...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-white text-white" />
                      Orchestrate Lesson Pipeline
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Multi-Agent Telemetry Rail (when generating) */}
            {pipeline && (
              <div className="glass-card p-6 border-cobalt-500/30 bg-cobalt-500/5 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/50 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cobalt-500 animate-ping" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Neural Multi-Agent Orchestrator
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-cobalt-600 dark:text-cobalt-400 font-bold">
                    Streaming Live Telemetry
                  </span>
                </div>

                <div className="space-y-3">
                  {AGENTS.map((agent) => {
                    const status = pipeline[agent.key as keyof PipelineProgress] || "waiting";
                    const Icon = agent.icon;
                    return (
                      <div
                        key={agent.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cobalt-500/10 flex items-center justify-center border border-cobalt-500/20">
                            <Icon className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              {agent.label}
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                ({agent.provider})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {agent.desc}
                            </div>
                          </div>
                        </div>
                        <div>{getAgentStatusBadge(status)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick-Start Pedagogical Templates */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-solar-500" />
                Pedagogical Quick-Start Blueprints
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PEDAGOGICAL_TEMPLATES.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => setOutline(tpl.prompt)}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 hover:border-cobalt-500/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 transition-all cursor-pointer group"
                  >
                    <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors flex items-center justify-between">
                      {tpl.title}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* --- RIGHT SIDEBAR: Recent Drafts & History (4 cols) --- */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cobalt-500" />
                  Your Recent Drafts
                </h3>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {lessons.length} saved
                </span>
              </div>

              {lessons.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No previous lessons found.<br />Start your first draft above!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => router.push(`/lessons/${lesson.id}`)}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-cobalt-500/40 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                        {lesson.title || lesson.outline}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-slate-400">
                        <span className={`capitalize ${lesson.status === 'generated' ? 'text-jade-500' : 'text-solar-500'}`}>
                          ● {lesson.status}
                        </span>
                        <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}
