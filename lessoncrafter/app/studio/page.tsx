"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Clock, 
  Loader2, 
  BookOpen, 
  Sparkles, 
  Zap, 
  Sliders, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb,
  CheckCircle2, 
  Target, 
  HelpCircle, 
  RefreshCw,
  Check, 
  Cpu, 
  Layers, 
  BookCheck, 
  FileText,
  Terminal,
  CornerDownLeft,
  ChevronRight,
  ShieldCheck,
  Code2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import GeneratingTelemetryVisualizer, { PipelineProgress } from "@/components/GeneratingTelemetryVisualizer";
import { DiagnosticQuestion } from "@/lib/agents/intakeAgent";

const LEARNER_LEVELS = [
  { 
    id: "elementary", 
    label: "Introductory", 
    tag: "BLOOM L2 · UNDERSTANDING", 
    desc: "Intuitive physical analogies & visual mental models" 
  },
  { 
    id: "high_school", 
    label: "Foundational", 
    tag: "BLOOM L3-L4 · APPLICATION", 
    desc: "Core theoretical foundations & standard problem sets" 
  },
  { 
    id: "college", 
    label: "College STEM", 
    tag: "BLOOM L5 · EVALUATION", 
    desc: "Rigorous mathematical proofs, derivations & state equations" 
  },
  { 
    id: "professional", 
    label: "Advanced / R&D", 
    tag: "BLOOM L6 · SYNTHESIS", 
    desc: "Industrial systems architecture, trade-offs & non-linear failure modes" 
  },
];

const QUICK_TOPICS = [
  { 
    title: "Quantum Entanglement & Bell States", 
    tag: "PHYSICS",
    desc: "Superposition, measurement collapse, and state vector experiments", 
    prompt: "Quantum Computing: Superposition, Bell State Entanglement, and EPR Measurement Collapse" 
  },
  { 
    title: "Transformer Attention Architecture", 
    tag: "AI / ML",
    desc: "Scaled dot-product attention, Q/K/V matrix projections, and attention heatmaps", 
    prompt: "Transformers Neural Architecture: Scaled Dot-Product Attention, Q/K/V Projections, and Masking Mechanics" 
  },
  { 
    title: "CRISPR-Cas9 Cleavage Dynamics", 
    tag: "GENOMICS",
    desc: "sgRNA hybridization, PAM kinetics, and double-strand break repair", 
    prompt: "Cellular Genetics: CRISPR-Cas9 Molecular Mechanism, Guide RNA Targeting, and Non-Homologous End Joining" 
  },
  { 
    title: "Multivariable Surface Optimization", 
    tag: "CALCULUS",
    desc: "Hessian matrices, Lagrange multipliers, and constraint manifolds", 
    prompt: "Multivariable Calculus Optimization: Critical Points, Hessian Matrices, and Constraint Surfaces" 
  },
];

export default function StudioPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("college");
  const [deliveryMode, setDeliveryMode] = useState<"student" | "teacher">("student");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pipeline, setPipeline] = useState<PipelineProgress | null>(null);

  // Diagnostic Follow-up States (Dual-Mode: Single & Multi Select)
  const [intakeQuestions, setIntakeQuestions] = useState<DiagnosticQuestion[]>([]);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string | string[]>>({});
  const [customStickingPoint, setCustomStickingPoint] = useState("");
  const [lastAnalyzedTopic, setLastAnalyzedTopic] = useState("");

  const supabase = createClient();
  const router = useRouter();

  // Trigger Follow-up Questions
  const fetchDiagnosticFollowups = async (topicToDiagnose?: string) => {
    const topic = (topicToDiagnose || outline).trim();
    if (!topic || topic.length < 3) return;

    setIntakeLoading(true);
    setLastAnalyzedTopic(topic);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level: selectedLevel }),
      });
      const data = await res.json();
      if (data.success && data.questions && data.questions.length > 0) {
        setIntakeQuestions(data.questions);
        const defaults: Record<string, string | string[]> = {};
        data.questions.forEach((q: DiagnosticQuestion) => {
          if (q.options && q.options.length > 0) {
            if (q.selectionType === "multiple") {
              defaults[q.id] = [q.options[0].id];
            } else {
              defaults[q.id] = q.options[0].id;
            }
          }
        });
        setIntakeAnswers((prev) => ({ ...defaults, ...prev }));
      }
    } catch (err) {
      console.warn("[Studio] Follow-up failed:", err);
    } finally {
      setIntakeLoading(false);
    }
  };

  const handleProceedToDiagnosis = () => {
    if (!outline.trim()) return;
    setStep(2);
    if (outline.trim() !== lastAnalyzedTopic || intakeQuestions.length === 0) {
      fetchDiagnosticFollowups(outline.trim());
    }
  };

  const handleSelectOption = (question: DiagnosticQuestion, optionId: string) => {
    if (question.selectionType === "multiple") {
      setIntakeAnswers((prev) => {
        const current = Array.isArray(prev[question.id])
          ? (prev[question.id] as string[])
          : prev[question.id]
          ? [prev[question.id] as string]
          : [];

        if (current.includes(optionId)) {
          if (current.length === 1) return prev; // keep at least 1
          return {
            ...prev,
            [question.id]: current.filter((id) => id !== optionId),
          };
        } else {
          return {
            ...prev,
            [question.id]: [...current, optionId],
          };
        }
      });
    } else {
      setIntakeAnswers((prev) => ({
        ...prev,
        [question.id]: optionId,
      }));
    }
  };

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
        .then(d => { if (d.profile) setUserProfile(d.profile); })
        .catch(() => {});
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
    
    const pendingPrompt = localStorage.getItem("pending_prompt");
    if (pendingPrompt) {
      setOutline(pendingPrompt);
      localStorage.removeItem("pending_prompt");
    }
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLessons = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const u = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
      let query = supabase.from("lessons").select("*");
      if (u && u.id) query = query.eq("user_id", u.id);
      const { data, error } = await query.order("created_at", { ascending: false }).limit(8);
      if (!error && data && data.length > 0) {
        setLessons(data);
        return;
      }
    } catch {
      // Supabase offline/fallback
    }

    // Graceful fallback to locally saved lessons from localStorage
    if (typeof window !== "undefined") {
      try {
        const localLessons: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("lesson_")) {
            const val = localStorage.getItem(key);
            if (val) {
              try {
                const parsed = JSON.parse(val);
                localLessons.push({
                  id: parsed.id,
                  title: parsed.title || parsed.outline || "Interactive Lesson",
                  outline: parsed.outline,
                  created_at: new Date().toISOString(),
                });
              } catch {}
            }
          }
        }
        if (localLessons.length > 0) {
          setLessons(localLessons.slice(0, 8));
        }
      } catch {}
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

      // Convert option IDs to descriptive strings for the generator
      const enrichedAnswers: Record<string, string> = {};
      intakeQuestions.forEach((q) => {
        const rawAns = intakeAnswers[q.id];
        if (Array.isArray(rawAns)) {
          const matched = q.options.filter(opt => rawAns.includes(opt.id));
          if (matched.length > 0) {
            enrichedAnswers[q.question] = `Multi-Select Choices: ${matched.map(m => m.label).join(", ")}`;
          }
        } else if (typeof rawAns === "string") {
          const matchedOpt = q.options.find(opt => opt.id === rawAns);
          if (matchedOpt) {
            enrichedAnswers[q.question] = `${matchedOpt.label} (${matchedOpt.sublabel || ""})`;
          } else if (rawAns) {
            enrichedAnswers[q.id] = rawAns;
          }
        }
      });

      if (customStickingPoint.trim()) {
        enrichedAnswers.stickingPoint = customStickingPoint.trim();
      }

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
          intakeAnswers: enrichedAnswers,
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
              if (typeof window !== "undefined") {
                localStorage.setItem(`lesson_${json.lessonId}`, JSON.stringify({
                  id: json.lessonId,
                  title: json.title,
                  outline: json.outline,
                  ts_code: json.ts_code,
                  status: "generated",
                  compile_error: null,
                }));
              }
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
            // Non-JSON boundary
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

  return (
    <div className="min-h-screen bg-background relative selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200 overflow-x-hidden">
      
      {/* ── Global Continuous Technical Blueprint Grid ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2563eb 1px, transparent 1px),
              linear-gradient(to bottom, #2563eb 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: "11px 11px"
          }}
        />

        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-cobalt-600/[0.12] dark:bg-cobalt-500/[0.18] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12] rounded-full blur-[160px] pointer-events-none" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="pt-20 sm:pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
          
          {/* ── Workspace Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-white/[0.08] font-mono text-[11px] tracking-wider text-slate-600 dark:text-slate-300 shadow-sm mb-3 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">COMPILATION STUDIO : ACTIVE</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-cyan-500 font-bold">MULTI-AGENT PIPELINE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Parametric Lesson <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-8">Studio.</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Configure your target pedagogical parameters. The compiler will orchestrate an interactive simulation, 
                step-by-step mathematical proof, and Socratic challenge in real time.
              </p>
            </div>

            <button
              onClick={() => router.push("/lessons")}
              className="px-4 py-2.5 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-white/[0.08] hover:border-cobalt-500/40 bg-white/80 dark:bg-[#0c111c]/80 backdrop-blur-md transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-sm hover:shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Explore Library</span>
            </button>
          </div>

          {/* ── 2-Step Precision Progress Dock ── */}
          <div className="mb-8 p-1.5 rounded-xl bg-white/80 dark:bg-[#0c111c]/80 border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl shadow-sm grid grid-cols-2 gap-1.5 font-mono text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`p-3 rounded-lg text-left transition-all flex items-center gap-3 cursor-pointer ${
                step === 1
                  ? "bg-cobalt-600 text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                step === 1 ? "bg-white text-cobalt-600" : "bg-slate-200 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
              }`}>
                01
              </div>
              <div>
                <div className="font-bold text-xs">Stage 01 : Prompt & Bloom Depth</div>
                <div className={`text-[10px] hidden sm:block font-sans ${step === 1 ? "text-cobalt-100" : "text-slate-400"}`}>
                  Define theorem, physical law, and target rigor
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (outline.trim().length >= 3) handleProceedToDiagnosis();
              }}
              disabled={outline.trim().length < 3}
              className={`p-3 rounded-lg text-left transition-all flex items-center gap-3 cursor-pointer ${
                step === 2
                  ? "bg-cobalt-600 text-white shadow-sm font-bold"
                  : outline.trim().length < 3
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                step === 2 ? "bg-white text-cobalt-600" : "bg-slate-200 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
              }`}>
                02
              </div>
              <div>
                <div className="font-bold text-xs">Stage 02 : Focus Areas & Diagnostics</div>
                <div className={`text-[10px] hidden sm:block font-sans ${step === 2 ? "text-cobalt-100" : "text-slate-400"}`}>
                  Refine mathematical constraints and inquiry scope
                </div>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ════ Main Workbench (8 cols) ════ */}
            <div className="lg:col-span-8 space-y-6">

              {/* ── STAGE 01 : PROMPT & RIGOR MATRIX ── */}
              {step === 1 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white/85 dark:bg-[#0c111c]/80 border border-slate-200/90 dark:border-white/[0.1] backdrop-blur-2xl shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6 animate-scale-in">
                  
                  {/* Prompt Command Console */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                      <span className="uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-cobalt-500" />
                        Theorem, Physical Law, or Algorithm
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400">
                        LaTeX $E=mc^2$ &amp; MathML Ready
                      </span>
                    </div>

                    <div className="relative bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-xl focus-within:border-cobalt-500 focus-within:ring-2 focus-within:ring-cobalt-500/20 transition-all overflow-hidden">
                      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200/70 dark:border-white/[0.06] bg-slate-100/50 dark:bg-white/[0.02] text-[10px] font-mono text-slate-400">
                        <span>LESSON_PROMPT_INPUT</span>
                        <span>{outline.length} CHARS</span>
                      </div>
                      <textarea
                        value={outline}
                        onChange={(e) => setOutline(e.target.value)}
                        placeholder="e.g. Quantum Computing: Superposition, Entanglement & Bell States with real-time state vector collapse and CHSH inequality proof..."
                        rows={4}
                        className="w-full bg-transparent p-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm leading-relaxed resize-none font-sans"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      Be as specific as you like. You can request mathematical proofs, parameter boundary conditions, or specific physical simulations.
                    </p>
                  </div>

                  {/* Target Bloom Rigor Depth Matrix */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
                      <span className="uppercase tracking-wider font-semibold text-slate-700 dark:text-slate-300">
                        Pedagogical Rigor Depth (Bloom Taxonomy)
                      </span>
                      <span className="text-[10px] text-cyan-400">DEPTH MATRIX</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {LEARNER_LEVELS.map((level) => {
                        const isSelected = selectedLevel === level.id;
                        return (
                          <button
                            key={level.id}
                            type="button"
                            onClick={() => setSelectedLevel(level.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                              isSelected
                                ? "bg-cobalt-600 text-white border-cobalt-500 shadow-md ring-1 ring-cobalt-500/30"
                                : "bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border-slate-200/80 dark:border-white/[0.06] text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-xs sm:text-sm">{level.label}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-200/70 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400"
                              }`}>
                                {level.tag}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed font-sans ${
                              isSelected ? "text-cobalt-100" : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {level.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Format & Privacy Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-200/70 dark:border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">CURRICULUM MODE:</span>
                      <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold">
                        <button
                          type="button"
                          onClick={() => setDeliveryMode("student")}
                          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                            deliveryMode === "student"
                              ? "bg-cobalt-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          Self-Study Lab
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryMode("teacher")}
                          className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                            deliveryMode === "teacher"
                              ? "bg-cobalt-600 text-white shadow-sm"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          Curriculum Plan
                        </button>
                      </div>
                    </div>

                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2 cursor-pointer font-sans select-none">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-cobalt-600 focus:ring-cobalt-500"
                      />
                      <span>Publish in community laboratory</span>
                    </label>
                  </div>

                  {/* Step 1 Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleProceedToDiagnosis}
                      disabled={!outline.trim() || outline.trim().length < 3}
                      className="w-full sm:flex-1 py-3.5 rounded-xl font-mono font-bold text-white text-xs uppercase tracking-wider bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] transition-all shadow-lg shadow-cobalt-600/25 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                    >
                      <span>Stage 02 : Refine Diagnostic Focus</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleSynthesize}
                      disabled={loading || !outline.trim()}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-mono font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c111c] transition-all disabled:opacity-40 cursor-pointer shadow-sm"
                    >
                      <span>Direct Compile (Skip Refinement)</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ── STAGE 02 : DIAGNOSTIC REFINEMENT ── */}
              {step === 2 && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white/85 dark:bg-[#0c111c]/80 border border-slate-200/90 dark:border-white/[0.1] backdrop-blur-2xl shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6 animate-scale-in">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 dark:border-white/[0.08] pb-4">
                    <div>
                      <div className="text-[10px] font-mono text-cobalt-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                        STAGE 02 · COGNITIVE INTAKE
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Refine Pedagogical Focus Areas
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        Topic: <span className="font-semibold text-slate-800 dark:text-slate-200">"{outline}"</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        type="button"
                        onClick={() => fetchDiagnosticFollowups()}
                        disabled={intakeLoading}
                        className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-cobalt-600 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/30 flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-3 h-3 ${intakeLoading ? "animate-spin text-cobalt-500" : ""}`} />
                        <span>Regenerate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black/30 flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Edit Prompt</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {intakeLoading && (
                    <div className="py-12 text-center space-y-3 font-mono text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-cobalt-600 mx-auto" />
                      <p className="font-medium text-slate-500 dark:text-slate-400">
                        Analyzing "{outline}" with pedagogical intake agent...
                      </p>
                    </div>
                  )}

                  {/* Follow-up Question Cards */}
                  {!intakeLoading && intakeQuestions.length > 0 && (
                    <div className="space-y-5">
                      {intakeQuestions.map((q, qIndex) => {
                        const isMulti = q.selectionType === "multiple";
                        const rawAnswer = intakeAnswers[q.id];
                        const selectedIds: string[] = Array.isArray(rawAnswer)
                          ? rawAnswer
                          : rawAnswer
                          ? [rawAnswer]
                          : [];

                        return (
                          <div 
                            key={q.id} 
                            className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-black/30 space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                {qIndex + 1}. {q.question}
                              </h4>

                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded bg-slate-200/70 dark:bg-white/[0.06]">
                                {isMulti ? "Multi-Select" : "Single Choice"}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                              {q.options.map((opt) => {
                                const isSelected = selectedIds.includes(opt.id);
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectOption(q, opt.id)}
                                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                      isSelected
                                        ? "bg-cobalt-600 text-white border-cobalt-600 shadow-sm"
                                        : "bg-white dark:bg-[#0c111c] border-slate-200/90 dark:border-white/[0.08] text-slate-800 dark:text-slate-200 hover:border-cobalt-500/40"
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-1.5">
                                        <span className="font-bold text-xs leading-snug">{opt.label}</span>
                                        
                                        {/* Indicator */}
                                        {isMulti ? (
                                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                            isSelected ? "bg-white text-cobalt-600 border-white" : "border-slate-300 dark:border-slate-700"
                                          }`}>
                                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </div>
                                        ) : (
                                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                                            isSelected ? "bg-white text-cobalt-600 border-white" : "border-slate-300 dark:border-slate-700"
                                          }`}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-cobalt-600" />}
                                          </div>
                                        )}
                                      </div>
                                      {opt.sublabel && (
                                        <p className={`text-[11px] mt-1.5 leading-relaxed ${
                                          isSelected ? "text-cobalt-100" : "text-slate-500 dark:text-slate-400"
                                        }`}>
                                          {opt.sublabel}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {/* Sticking Point / Specific Mathematical Focus Input */}
                      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0c111c]">
                        <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          SPECIFIC FORMULA, DERIVATION, OR FAILURE MODE (OPTIONAL):
                        </label>
                        <input
                          type="text"
                          value={customStickingPoint}
                          onChange={(e) => setCustomStickingPoint(e.target.value)}
                          placeholder="e.g. Include the full mathematical derivation of the Bell-CHSH inequality bound |S| <= 2..."
                          className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-lg px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-500 font-sans"
                        />
                      </div>
                    </div>
                  )}

                  {/* Primary Launch Action */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSynthesize}
                      disabled={loading || !outline.trim()}
                      className="w-full sm:flex-1 py-3.5 rounded-xl font-mono font-bold text-white text-xs uppercase tracking-wider bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] transition-all shadow-lg shadow-cobalt-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Compiling multi-agent modules...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-white text-white" />
                          <span>Compile Lesson Now</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-mono font-semibold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0c111c] transition-all cursor-pointer shadow-sm"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                      <span>Back</span>
                    </button>
                  </div>

                </div>
              )}

              {/* ── Live Multi-Agent Pipeline Visualizer (Streaming) ── */}
              {pipeline && (
                <div className="my-8">
                  <GeneratingTelemetryVisualizer pipeline={pipeline} topicTitle={outline} />
                </div>
              )}

              {/* ── Quick-Start Verified Lesson Blueprints ── */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="uppercase tracking-wider font-semibold text-slate-600 dark:text-slate-300">
                    Quick-Start Studio Blueprints
                  </span>
                  <span className="text-[10px] text-cyan-400">VERIFIED STEM LABS</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUICK_TOPICS.map((tpl, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setOutline(tpl.prompt);
                        setStep(2);
                        fetchDiagnosticFollowups(tpl.prompt);
                      }}
                      className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c111c]/75 hover:border-cobalt-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-md backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                          {tpl.title}
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                          {tpl.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                        {tpl.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* ════ Right Sidebar Deck (4 cols) ════ */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Laboratory Verification Architecture Specification */}
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0c111c]/75 border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl shadow-sm space-y-4">
                <div className="pb-3 border-b border-slate-200/70 dark:border-white/[0.08] flex items-center justify-between font-mono text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Compiled Module Specifications
                  </span>
                  <span className="text-emerald-500 text-[10px] font-bold">● v2.4</span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">01 · Parametric Simulator</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                        Hardware-accelerated 60 FPS vector canvas with interactive physical dials.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">02 · First-Principles Derivation</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                        Step-by-step LaTeX proofs with intermediate mathematical logic.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">03 · Socratic Counter-Test</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                        Gedankenexperiment paradoxes that detect and eliminate misconceptions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">04 · Publication Export</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-sans">
                        Dual-mode view with vector PDF and self-contained HTML export.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Compiled Labs Deck */}
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-[#0c111c]/75 border border-slate-200/90 dark:border-white/[0.08] backdrop-blur-xl shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/[0.08] mb-3 font-mono text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cobalt-500" />
                    <span>Recent Laboratories</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {lessons.length} COMPILED
                  </span>
                </div>

                {lessons.length === 0 ? (
                  <div className="py-6 text-center text-xs font-mono text-slate-400">
                    No compiled labs found.<br />Orchestrate your first module above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => router.push(`/lessons/${lesson.id}`)}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-black/30 hover:border-cobalt-500/50 hover:bg-white dark:hover:bg-white/[0.04] transition-all cursor-pointer group"
                      >
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-cobalt-600 dark:group-hover:text-cyan-400 transition-colors">
                          {lesson.title || lesson.outline}
                        </div>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-slate-400">
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            READY
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

    </div>
  );
}
