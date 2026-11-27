"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LessonRunner from "@/components/LessonRunner";
import SocraticTutorDrawer from "@/components/SocraticTutorDrawer";
import GeneratingTelemetryVisualizer from "@/components/GeneratingTelemetryVisualizer";
import LessonDocumentView from "@/components/LessonDocumentView";
import { extractLessonDocument } from "@/lib/extractLessonDocument";
import { 
  ChevronLeft, 
  RotateCcw, 
  ShieldAlert, 
  Code2, 
  Loader2, 
  Wrench, 
  BookOpen, 
  Download, 
  Printer, 
  FileText, 
  Sparkles,
  Terminal,
  Sliders,
  CheckCircle2,
  Atom
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface Lesson {
  id: string;
  title: string;
  outline: string; 
  ts_code: string | null;
  compile_error: string | null;
  status: string;
}

export default function LessonViewer() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawCode, setShowRawCode] = useState(false);
  const [viewMode, setViewMode] = useState<"interactive" | "document">("interactive");
  
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [repairAttempts, setRepairAttempts] = useState(0);
  const [lastRepairAttempt, setLastRepairAttempt] = useState<string | null>(null);
  const isBusy = isRepairing || isRegenerating;

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      let lessonFound: Lesson | null = null;

      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("id, title, outline, ts_code, compile_error, status")
          .eq("id", id)
          .single();
        
        if (!error && data) {
          lessonFound = data;
        } else if (error) {
          console.warn("[LessonViewer] DB query notice:", error.message);
        }
      } catch (err) {
        console.warn("[LessonViewer] Remote database unreachable, checking local cache...");
      }

      // Check local cache if database was unavailable or lesson was created locally
      if (!lessonFound && typeof window !== "undefined") {
        const localCached = localStorage.getItem(`lesson_${id}`);
        if (localCached) {
          try {
            lessonFound = JSON.parse(localCached);
          } catch (e) {
            console.error("Local parse error:", e);
          }
        }
      }

      setLesson(lessonFound);
      setLoading(false);
    };
    fetchLesson();
  }, [id, supabase]);

  const handleRepairLesson = async (specificError?: string) => {
    if (!lesson || !lesson.ts_code || isRepairing || isRegenerating) return;
    const errToFix = specificError || runtimeError || "SyntaxError: Unexpected token in laboratory component";
    if (repairAttempts >= 2) return;
    
    setIsRepairing(true);
    setLastRepairAttempt(errToFix);
    setRepairAttempts(prev => prev + 1);

    try {
      const response = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          outline: lesson.outline,
          originalCode: lesson.ts_code,
          errorMessage: errToFix,
        }),
      });

      const result = await response.json();

      if (result.success && result.repairedCode) {
        const updatedLesson = { 
          ...lesson, 
          ts_code: result.repairedCode, 
          compile_error: null,
          status: 'generated' 
        };
        setLesson(updatedLesson);
        setRuntimeError(null);
        if (typeof window !== "undefined") {
          localStorage.setItem(`lesson_${lesson.id}`, JSON.stringify(updatedLesson));
        }
      } else {
        setRuntimeError(`Repair attempt failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setRuntimeError(`Repair request failed: ${err.message}`);
    } finally {
      setIsRepairing(false);
    }
  };
  
  const handleRegenerateLesson = async () => {
    if (!lesson || isRegenerating || isRepairing) return;

    setIsRegenerating(true);
    setRuntimeError(null);
    setLastRepairAttempt(null);
    setRepairAttempts(0);

    try {
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          outline: lesson.outline,
        }),
      });

      const result = await response.json();

      if (result.success && result.generatedCode) {
        const updatedLesson = { 
          ...lesson, 
          ts_code: result.generatedCode, 
          compile_error: null,
          status: 'generated' 
        };
        setLesson(updatedLesson);
        setRuntimeError(null);
        if (typeof window !== "undefined") {
          localStorage.setItem(`lesson_${lesson.id}`, JSON.stringify(updatedLesson));
        }
      } else {
        setRuntimeError(`Regeneration failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setRuntimeError(`Regeneration request failed: ${err.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportHtml = () => {
    if (!lesson) return;
    const doc = extractLessonDocument(lesson.title, lesson.outline, lesson.ts_code);
    const cleanTitle = doc.title;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cleanTitle} - LessonCrafter Laboratory</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0f18; color: #f8fafc; padding: 2.5rem; max-width: 900px; margin: auto; line-height: 1.7; }
    h1 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 0.75rem; margin-top: 1rem; font-size: 2.2rem; }
    .badge { display: inline-block; padding: 0.35rem 0.85rem; background: #2563eb; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-right: 0.5rem; }
    .badge-alt { display: inline-block; padding: 0.35rem 0.85rem; background: #1e293b; color: #94a3b8; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 1rem; padding: 1.5rem; margin: 1.5rem 0; }
    .anchor { background: #1e293b; border-left: 4px solid #38bdf8; padding: 1.25rem; border-radius: 0.75rem; margin: 1.5rem 0; font-style: italic; color: #e2e8f0; }
    footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1e293b; font-size: 0.8rem; color: #64748b; font-family: monospace; }
  </style>
</head>
<body>
  <div style="margin-bottom: 1rem;">
    <span class="badge">${doc.subject}</span>
    <span class="badge-alt">${doc.level}</span>
  </div>
  <h1>${cleanTitle}</h1>
  <p style="font-size: 1.15rem; color: #cbd5e1; margin-bottom: 2rem;">${doc.introduction}</p>

  ${doc.intuitiveAnchor ? `<div class="anchor"><strong>Intuitive Anchor:</strong> "${doc.intuitiveAnchor}"</div>` : ""}

  <div class="card">
    <h3 style="margin-top:0; color:#38bdf8; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.05em;">Core Objectives</h3>
    <ul style="padding-left:1.25rem; margin-bottom:0;">
      ${doc.objectives.map(o => `<li>${o}</li>`).join("")}
    </ul>
  </div>

  ${doc.sections.map((s, i) => `
    <div class="card">
      <h2 style="color:#60a5fa; margin-top:0; font-size:1.35rem;">Module ${i + 1}: ${s.title}</h2>
      <p>${s.explanation}</p>
      ${s.example ? `<div style="background:#0f172a; border-left:3px solid #10b981; padding:0.75rem 1rem; margin:1rem 0; font-size:0.9rem;"><strong>Physical Realization:</strong> ${s.example}</div>` : ""}
      ${s.misconception ? `<div style="background:#0f172a; border-left:3px solid #f59e0b; padding:0.75rem 1rem; margin:1rem 0; font-size:0.9rem;"><strong>Misconception Alert:</strong> ${s.misconception}</div>` : ""}
    </div>
  `).join("")}

  ${doc.quiz.length === 0 ? "" : `
    <div class="card">
      <h2 style="color:#34d399; margin-top:0;">Formative Assessment</h2>
      ${doc.quiz.map((q, qIdx) => `
        <div style="margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid #1e293b;">
          <p><strong>${qIdx + 1}. ${q.question}</strong></p>
          <div style="margin-left:0.5rem;">
            ${q.options.map((opt, oIdx) => `
              <div style="padding:0.4rem 0.8rem; margin:0.35rem 0; background:${oIdx === q.correctIndex ? '#064e3b' : '#1e293b'}; border-radius:0.5rem; font-size:0.9rem;">
                ${String.fromCharCode(65 + oIdx)}) ${opt} ${oIdx === q.correctIndex ? "✓" : ""}
              </div>
            `).join("")}
          </div>
          <div style="font-size:0.85rem; color:#94a3b8; margin-top:0.75rem;"><strong>Analysis:</strong> ${q.explanation}</div>
        </div>
      `).join("")}
    </div>
  `}

  <footer>LessonCrafter Parametric Laboratory Platform</footer>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200 overflow-x-hidden">
      
      {/* ── Global Technical Blueprint Grid (Unified Atmosphere) ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        
        {/* Primary 44px Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-[0.09] dark:opacity-[0.16]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2563eb 1px, transparent 1px),
              linear-gradient(to bottom, #2563eb 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        {/* Fine 11px Micro-Grid */}
        <div 
          className="absolute inset-0 opacity-[0.045] dark:opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: "11px 11px"
          }}
        />

        {/* Animated Laser Horizon Beam */}
        <div 
          className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cobalt-400/40 to-transparent blur-[0.5px] top-[14%] animate-pulse pointer-events-none"
        />

        {/* Ambient Top Cobalt Core Luster */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-cobalt-600/[0.12] dark:bg-cobalt-500/[0.18] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12] rounded-full blur-[160px] pointer-events-none" />

        {/* Architectural Flank Rulers */}
        <div className="hidden 2xl:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 text-cobalt-500/80 font-bold">
            AXIS_Y : 0.00 → 1.00
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-cobalt-500/40 via-slate-700/40 to-transparent" />
          <span>[ψ] RUNNING</span>
        </div>

        <div className="hidden 2xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] text-cyan-500/80 font-bold">
            RUNTIME : 60FPS
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-transparent" />
          <span>[TeX] COMPILED</span>
        </div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Busy Overlay */}
        {isBusy && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cobalt-500/20 blur-3xl rounded-full" />
              <Loader2 className="animate-spin w-14 h-14 text-cobalt-500 mb-6 relative z-10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 text-center">
              {isRepairing ? "Diagnosing & Auto-Repairing Component..." : "Rebuilding Laboratory Runtime..."}
            </h2>
            <p className="text-slate-400 font-mono text-xs text-center">
              {isRepairing ? "Inspecting AST syntax and repairing runtime handler..." : "Re-orchestrating multi-agent synthesis pipeline..."}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <div className="text-center p-8 rounded-xl bg-white/70 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
              <Loader2 className="animate-spin w-10 h-10 text-cobalt-600 dark:text-cobalt-400 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-300 font-mono text-xs font-bold uppercase tracking-wider">
                Loading Laboratory Runtime...
              </p>
              <p className="text-slate-400 font-sans text-[11px] mt-1">
                Compiling vector graph and mathematical proofs
              </p>
            </div>
          </div>
        ) : !lesson ? (
          <div className="flex flex-col justify-center items-center min-h-[70vh] px-6">
            <div className="p-8 sm:p-10 rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs text-center max-w-md">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-1.5 text-slate-900 dark:text-white">Laboratory Not Found</h2>
              <p className="text-slate-500 text-xs mb-6 leading-relaxed">
                The laboratory module you are looking for may have expired or was removed.
              </p>
              <button
                onClick={() => router.push("/studio")}
                className="w-full py-2.5 bg-cobalt-600 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider hover:bg-cobalt-500 transition-all shadow-md shadow-cobalt-600/20 active:scale-95 cursor-pointer"
              >
                Synthesize New Lab in Studio
              </button>
            </div>
          </div>
        ) : (
          <main className="pt-4 sm:pt-6 pb-16 px-4 sm:px-6 max-w-[960px] mx-auto">
            
            {/* ── Top Command Bar ── */}
            <div className="mb-3.5 p-2 sm:p-2.5 rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              
              {/* Breadcrumb Navigation */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  onClick={() => router.push("/studio")}
                  className="group flex items-center gap-1 font-bold text-slate-500 hover:text-cobalt-600 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>STUDIO</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <button
                  onClick={() => router.push("/lessons")}
                  className="font-bold text-slate-500 hover:text-cobalt-600 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>EXPLORE</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-[260px]">
                  {lesson.title || lesson.outline}
                </span>
              </div>

              {/* Mode Switcher & Actions */}
              <div className="flex items-center gap-1.5 self-start md:self-auto flex-wrap">
                
                {/* Mode Switcher: Interactive Lab vs Reading View */}
                <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-[11px] font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode("interactive")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === "interactive"
                        ? "bg-cobalt-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Atom className="w-3 h-3 text-cyan-400" />
                    <span>Interactive Lab</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("document")}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                      viewMode === "document"
                        ? "bg-cobalt-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    <span>Reading View</span>
                  </button>
                </div>

                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-wider ${
                  lesson.status === "generated"
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : "text-solar-500 border-solar-500/20 bg-solar-500/10"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready</span>
                </div>

                <button
                  onClick={handleExportHtml}
                  title="Download standalone HTML file"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-white/[0.08] hover:border-cobalt-500/40 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-3 h-3 text-cobalt-500" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => window.print()}
                  title="Print or Save as PDF"
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-white/[0.08] hover:border-cobalt-500/40 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs"
                >
                  <Printer className="w-3 h-3 text-cyan-500" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={handleRegenerateLesson}
                  disabled={isBusy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200/80 dark:border-white/[0.08] hover:border-cobalt-500/40 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3 h-3 text-cobalt-500" />
                  <span>Rebuild</span>
                </button>

              </div>
            </div>

            {/* ── Lesson Surface Frame ── */}
            <div className="w-full">
              {lesson.status === "generating" ? (
                <div className="py-8">
                  <GeneratingTelemetryVisualizer pipeline={null} topicTitle={lesson.outline || lesson.title} />
                </div>
              ) : (lesson.compile_error || !lesson.ts_code) ? (
                <div className="p-6 sm:p-8 rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-rose-500/30 backdrop-blur-xl shadow-sm my-4">
                  <div className="flex items-center gap-2 text-rose-500 mb-3 font-mono font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>SYNTAX COMPILE NOTICE</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs mb-4 leading-relaxed font-sans">
                    Encountered a compile-time syntax conflict while generating <strong>&ldquo;{lesson.outline}&rdquo;</strong>.
                  </p>
                  <div className="bg-black/60 rounded-lg p-3 mb-5 border border-rose-500/20 font-mono text-xs text-rose-400 overflow-x-auto shadow-inner">
                    {lesson.compile_error || "ts_code is empty."}
                  </div>
                  <button 
                    onClick={handleRegenerateLesson} 
                    disabled={isBusy}
                    className="px-4 py-2 bg-cobalt-600 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider hover:bg-cobalt-500 transition-all shadow-md shadow-cobalt-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Rebuild Laboratory</span>
                  </button>
                </div>
              ) : viewMode === "document" ? (
                <LessonDocumentView
                  document={extractLessonDocument(lesson.title, lesson.outline, lesson.ts_code)}
                  rawTsCode={lesson.ts_code}
                />
              ) : (
                <>
                  {/* Live React Component Execution */}
                  <div className="w-full rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/75 dark:bg-[#0c111c]/80 backdrop-blur-xl shadow-lg p-4 sm:p-6 transition-all">
                    
                    {/* Laboratory Instrument Sub-Header */}
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/70 dark:border-white/[0.06] text-[10px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          VECTOR SIMULATION STAGE : 60 FPS
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-cobalt-600 dark:text-cyan-400 font-bold">FIRST-PRINCIPLES MATH</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span>SOCRATIC INTERACTIVE</span>
                      </div>
                    </div>

                    <LessonRunner
                      key={lesson.ts_code}
                      code={lesson.ts_code}
                      onAutonomousRepair={(error) => handleRepairLesson(error.message)}
                      onRebuild={handleRegenerateLesson}
                      isRepairing={isRepairing}
                      repairAttempts={repairAttempts}
                    />
                  </div>

                  {/* Source Code Inspector Section */}
                  <div className="w-full pt-4">

                    <div className="text-center pt-2">
                      <button 
                        onClick={() => setShowRawCode(!showRawCode)}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-cobalt-600 dark:hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{showRawCode ? "Hide Laboratory AST Source" : "Inspect Compiled Source Code"}</span>
                      </button>
                      
                      {showRawCode && (
                        <div className="mt-3 text-left p-4 font-mono text-xs leading-relaxed text-slate-300 bg-black/70 overflow-x-auto border border-slate-200/80 dark:border-white/[0.08] shadow-inner rounded-xl backdrop-blur-md">
                          <pre className="whitespace-pre-wrap break-words">{lesson.ts_code}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <footer className="mt-10 pt-6 border-t border-slate-200/70 dark:border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              <div>LessonCrafter · Parametric STEM Platform</div>
              <div>Hardware Accelerated Interactive Synthesis</div>
            </footer>

            {/* Study Assistant Sidecar Drawer */}
            <SocraticTutorDrawer lessonTitle={lesson.title || lesson.outline} lessonOutline={lesson.outline} />
          </main>
        )}
      </div>

    </div>
  );
}
