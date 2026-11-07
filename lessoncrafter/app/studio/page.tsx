"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Clock, Loader2, BookOpen, 
  Sparkles, Zap, 
  Sliders, ArrowRight, ArrowLeft, Lightbulb,
  CheckCircle2, Target, HelpCircle, RefreshCw,
  Check, Cpu, Layers, BookCheck, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import GeneratingTelemetryVisualizer, { PipelineProgress } from "@/components/GeneratingTelemetryVisualizer";
import { DiagnosticQuestion } from "@/lib/agents/intakeAgent";

const LEARNER_LEVELS = [
  { id: "elementary", label: "Introductory", tag: "Beginner", desc: "Intuitive analogies & visual mental models" },
  { id: "high_school", label: "Foundational", tag: "High School / AP", desc: "Core theory & standard problem sets" },
  { id: "college", label: "College STEM", tag: "Undergraduate", desc: "Rigorous math, derivations & state equations" },
  { id: "professional", label: "Advanced / R&D", tag: "Professional", desc: "Industrial systems, trade-offs & failure modes" },
];

const QUICK_TOPICS = [
  { 
    title: "Quantum Entanglement & Bell States", 
    tag: "Physics",
    desc: "Superposition, measurement collapse, and state vector experiments", 
    prompt: "Quantum Computing: Superposition, Bell State Entanglement, and EPR Measurement Collapse" 
  },
  { 
    title: "Transformer Attention Architecture", 
    tag: "Computer Science",
    desc: "Scaled dot-product attention, Q/K/V matrix projections, and attention heatmaps", 
    prompt: "Transformers Neural Architecture: Scaled Dot-Product Attention, Q/K/V Projections, and Masking Mechanics" 
  },
  { 
    title: "Population Genetics & Hardy-Weinberg", 
    tag: "Biology",
    desc: "Allele frequency drift, natural selection, and equilibrium derivations", 
    prompt: "Hardy-Weinberg Equilibrium: Mathematical Derivations, Genetic Drift, and Allele Frequency Simulations" 
  },
  { 
    title: "Multivariable Calculus Optimization", 
    tag: "Mathematics",
    desc: "Extreme value theorem, Lagrange multipliers, and surface tangent gradients", 
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
        // Pre-select default option(s) for each question if not already answered
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Workspace Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/20 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Lesson Builder
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Create a <span className="text-gradient">Lesson</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Enter any topic in STEM or computer science to generate an interactive simulator, step-by-step theory, and practice questions.
            </p>
          </div>

          <button
            onClick={() => router.push("/lessons")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 bg-white dark:bg-slate-900/50 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cobalt-500" />
            <span>View Library</span>
          </button>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="mb-8 p-2 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
              step === 1
                ? "bg-cobalt-500/10 border border-cobalt-500/40 text-cobalt-600 dark:text-cobalt-400"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              step === 1 ? "bg-cobalt-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              1
            </div>
            <div>
              <div className="text-xs font-bold">1. Topic & Level</div>
              <div className="text-[11px] text-slate-400 hidden sm:block">What do you want to learn?</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (outline.trim().length >= 3) handleProceedToDiagnosis();
            }}
            disabled={outline.trim().length < 3}
            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${
              step === 2
                ? "bg-cobalt-500/10 border border-cobalt-500/40 text-cobalt-600 dark:text-cobalt-400"
                : outline.trim().length < 3
                ? "opacity-50 cursor-not-allowed text-slate-400"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
              step === 2 ? "bg-cobalt-600 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              2
            </div>
            <div>
              <div className="text-xs font-bold">2. Focus Areas</div>
              <div className="text-[11px] text-slate-400 hidden sm:block">Choose what to emphasize</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Workbench (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* STEP 1: TOPIC & LEVEL */}
            {step === 1 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Topic or Question
                  </label>
                  <textarea
                    value={outline}
                    onChange={(e) => setOutline(e.target.value)}
                    placeholder="e.g. Quantum Computing: Superposition, Entanglement & Bell States with interactive state vector simulation..."
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cobalt-500/30 focus:border-cobalt-500 text-sm leading-relaxed transition-all resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Be as specific as you like. You can request mathematical proofs, physical models, or code examples.
                  </p>
                </div>

                {/* Target Level */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    Target Depth & Level
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {LEARNER_LEVELS.map((level) => {
                      const isSelected = selectedLevel === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setSelectedLevel(level.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-cobalt-500/10 border-cobalt-500 text-cobalt-600 dark:text-cobalt-400 shadow-sm"
                              : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                          }`}
                        >
                          <div className="font-bold text-xs">{level.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{level.tag}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Role Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Format:</span>
                    <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode("student")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          deliveryMode === "student"
                            ? "bg-cobalt-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        Self-Study Course
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMode("teacher")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          deliveryMode === "teacher"
                            ? "bg-cobalt-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        Lesson Plan
                      </button>
                    </div>
                  </div>

                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-slate-300 text-cobalt-600 focus:ring-cobalt-500"
                    />
                    <span>Share in community library</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleProceedToDiagnosis}
                    disabled={!outline.trim() || outline.trim().length < 3}
                    className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-white text-xs uppercase tracking-wider bg-cobalt-600 hover:bg-cobalt-500 transition-all shadow-md shadow-cobalt-600/20 flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
                  >
                    <span>Next: Customize Focus Areas</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSynthesize}
                    disabled={loading || !outline.trim()}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <span>Skip & Build Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMIZE FOCUS AREAS */}
            {step === 2 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Customize Your Lesson
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Topic: <span className="font-semibold text-slate-800 dark:text-slate-200">"{outline}"</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fetchDiagnosticFollowups()}
                      disabled={intakeLoading}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-cobalt-600 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${intakeLoading ? "animate-spin text-cobalt-500" : ""}`} />
                      <span>Refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Edit Topic</span>
                    </button>
                  </div>
                </div>

                {/* Loading Questions State */}
                {intakeLoading && (
                  <div className="py-8 text-center space-y-3">
                    <Loader2 className="w-6 h-6 animate-spin text-cobalt-600 mx-auto" />
                    <p className="text-xs font-medium text-slate-500">
                      Generating tailored questions for "{outline}"...
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
                          className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {qIndex + 1}. {q.question}
                            </h4>

                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 self-start sm:self-auto px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800">
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
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-cobalt-500/40"
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

                    {/* Sticking Point Input */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Have a specific formula or question in mind? (Optional)
                      </label>
                      <input
                        type="text"
                        value={customStickingPoint}
                        onChange={(e) => setCustomStickingPoint(e.target.value)}
                        placeholder="e.g. Include the full mathematical derivation of the wave equation..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-500"
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
                    className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-white text-xs uppercase tracking-wider bg-cobalt-600 hover:bg-cobalt-500 transition-all shadow-md shadow-cobalt-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating your lesson...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white text-white" />
                        <span>Build My Lesson</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
                    <span>Back</span>
                  </button>
                </div>

              </div>
            )}

            {/* Live Progress Card (During Generation) */}
            {pipeline && (
              <div className="my-8">
                <GeneratingTelemetryVisualizer pipeline={pipeline} topicTitle={outline} />
              </div>
            )}

            {/* Quick-Start Topic Blueprints */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick-Start Lesson Ideas
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_TOPICS.map((tpl, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setOutline(tpl.prompt);
                      setStep(2);
                      fetchDiagnosticFollowups(tpl.prompt);
                    }}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cobalt-500/40 transition-all cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                        {tpl.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {tpl.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {tpl.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* What's In Your Lesson */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-3 border-b border-slate-100 dark:border-slate-800">
                What's in every lesson
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Interactive Simulation</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Live sliders and visual graphs to manipulate parameters in real time.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-marine-500/10 text-marine-600 dark:text-marine-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">In-Depth Modules</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive theoretical derivations, formulas, and real-world examples.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Step-by-Step Problem</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Worked challenge scenario showing calculations and conservation checks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-solar-500/10 text-solar-600 dark:text-solar-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">Practice Quiz & Hints</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Instant feedback explaining common mistakes and the correct solution.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Drafts */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cobalt-500" />
                  <span>Your Recent Lessons</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 font-bold">
                  {lessons.length} saved
                </span>
              </div>

              {lessons.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No previous lessons found.<br />Start your first lesson above!
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => router.push(`/lessons/${lesson.id}`)}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-cobalt-500/40 hover:bg-slate-50 transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                        {lesson.title || lesson.outline}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-500 font-semibold">
                          ● Ready
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
