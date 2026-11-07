// app/lessons/[id]/page.tsx
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
  ChevronLeft, RotateCcw, ShieldAlert, 
  Code2, Loader2, Wrench, BookOpen, 
  Download, Printer, FileText, Sparkles 
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

  const handleRepairLesson = async () => {
    if (!runtimeError || !lesson || !lesson.ts_code || isRepairing) return;
    if (runtimeError === lastRepairAttempt) return;
    if (repairAttempts >= 2) {
      alert("Maximum auto-repair attempts reached for this session. Please try a full regeneration.");
      return;
    }
    
    setIsRepairing(true);
    setLastRepairAttempt(runtimeError);
    setRepairAttempts(prev => prev + 1);

    try {
      const response = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          outline: lesson.outline,
          originalCode: lesson.ts_code,
          errorMessage: runtimeError,
        }),
      });

      const result = await response.json();

      if (result.success && result.repairedCode) {
        setLesson({ 
          ...lesson, 
          ts_code: result.repairedCode, 
          compile_error: null,
          status: 'generated' 
        });
        setRuntimeError(null);
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
        setLesson({ 
          ...lesson, 
          ts_code: result.generatedCode, 
          compile_error: null,
          status: 'generated' 
        });
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
  <title>${cleanTitle} - LessonCrafter Courseware</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2.5rem; max-width: 900px; margin: auto; line-height: 1.7; }
    h1 { color: #38bdf8; border-bottom: 2px solid #1e293b; padding-bottom: 0.75rem; margin-top: 1rem; font-size: 2.2rem; }
    .badge { display: inline-block; padding: 0.35rem 0.85rem; background: #2563eb; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-right: 0.5rem; }
    .badge-alt { display: inline-block; padding: 0.35rem 0.85rem; background: #1e293b; color: #94a3b8; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 1rem; padding: 1.5rem; margin: 1.5rem 0; }
    .anchor { background: #1e293b; border-left: 4px solid #38bdf8; padding: 1.25rem; border-radius: 0.75rem; margin: 1.5rem 0; font-style: italic; color: #e2e8f0; }
    .alert { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; color: #fef3c7; }
    .quiz-card { background: #0b1120; border: 1px solid #1e293b; border-radius: 1rem; padding: 1.25rem; margin: 1.25rem 0; }
    .opt { background: #1e293b; padding: 0.65rem 1rem; border-radius: 0.5rem; margin: 0.4rem 0; font-size: 0.9rem; }
    .correct { background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #6ee7b7; font-weight: bold; }
    ul { padding-left: 1.25rem; }
    li { margin-bottom: 0.5rem; }
    footer { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #1e293b; font-size: 0.8rem; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div>
    <span class="badge">${doc.subject}</span>
    <span class="badge-alt">${doc.level}</span>
  </div>
  <h1>${cleanTitle}</h1>
  <p style="font-size: 1.1rem; color: #cbd5e1;">${doc.introduction}</p>

  ${doc.intuitiveAnchor ? `<div class="anchor"><strong>Intuitive Anchor:</strong> &ldquo;${doc.intuitiveAnchor}&rdquo;</div>` : ""}

  <div class="card">
    <h3 style="margin-top:0; color:#38bdf8; font-size:0.9rem; text-transform:uppercase;">Core Competencies & Learning Objectives</h3>
    <ul>
      ${doc.objectives.map(o => `<li>${o}</li>`).join("")}
    </ul>
  </div>

  ${doc.sections.map((s, idx) => `
    <div class="card">
      <h2 style="color: #f8fafc; font-size: 1.4rem;">${s.title}</h2>
      <p>${s.explanation}</p>
      ${s.keyPoints?.length ? `
        <h4 style="color:#94a3b8; margin-bottom:0.5rem;">Key Takeaways:</h4>
        <ul>${s.keyPoints.map(k => `<li>${k}</li>`).join("")}</ul>
      ` : ""}
      ${s.misconception ? `
        <div class="alert">
          <strong>⚠️ Misconception Trap:</strong> ${s.misconception}
        </div>
      ` : ""}
    </div>
  `).join("")}

  <h2 style="margin-top: 2.5rem; color:#38bdf8;">Practice Questions & Solutions</h2>
  ${doc.quiz.map((q, i) => `
    <div class="quiz-card">
      <div style="font-weight:bold; margin-bottom:0.75rem;">Q${i + 1}: ${q.question}</div>
      ${q.options.map((opt, oIdx) => `
        <div class="opt ${oIdx === q.correctIndex ? "correct" : ""}">
          [${String.fromCharCode(65 + oIdx)}] ${opt} ${oIdx === q.correctIndex ? "✓ (Correct)" : ""}
        </div>
      `).join("")}
      <div style="font-size:0.85rem; color:#94a3b8; margin-top:0.75rem;"><strong>Explanation:</strong> ${q.explanation}</div>
    </div>
  `).join("")}

  <footer>Published with LessonCrafter</footer>
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

  if (loading)
    return (
      <main className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-cobalt-600 mx-auto mb-4" />
          <p className="text-slate-500 font-mono text-sm">Loading your lesson...</p>
        </div>
      </main>
    );

  if (!lesson)
    return (
      <main className="flex flex-col justify-center items-center min-h-screen bg-background px-6">
        <div className="glass-card p-12 text-center max-w-lg">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Lesson Not Found</h2>
          <p className="text-slate-500 mb-8 text-sm">The lesson you&apos;re looking for might have been deleted or moved.</p>
          <button
            onClick={() => router.push("/studio")}
            className="w-full py-4 bg-cobalt-600 text-white rounded-xl font-bold hover:bg-cobalt-500 transition-all active:scale-95 shadow-lg shadow-cobalt-600/20"
          >
            Return to Lesson Builder
          </button>
        </div>
      </main>
    );

  const { title, ts_code, compile_error, status, outline } = lesson;
  const isBusy = isRepairing || isRegenerating;

  return (
    <main className="min-h-screen bg-background text-foreground relative pb-20 transition-colors duration-200">
      <Navbar />
      
      {/* Busy Overlay */}
      {isBusy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-cobalt-500/20 blur-3xl rounded-full" />
            <Loader2 className="animate-spin w-16 h-16 text-cobalt-500 mb-8 relative z-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 text-center">
            {isRepairing ? "Updating Lesson..." : "Rebuilding Lesson..."}
          </h2>
          <p className="text-slate-400 font-mono text-sm text-center">
            {isRepairing ? "Diagnosing component and applying fix..." : "Regenerating interactive modules..."}
          </p>
        </div>
      )}

      {/* Top action bar — back button + action buttons */}
      <div className="pt-24 pb-4 px-4 sm:px-6 max-w-[940px] mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/studio")}
              className="group flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 hover:text-cobalt-600 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              BUILDER
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <button
              onClick={() => router.push("/lessons")}
              className="text-xs font-mono font-bold text-slate-500 hover:text-cobalt-600 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              EXPLORE
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher: Interactive Lab vs Reading View */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "interactive"
                    ? "bg-cobalt-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Interactive Lab</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("document")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "document"
                    ? "bg-cobalt-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reading View</span>
              </button>
            </div>

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${
              status === "generated"
                ? "text-jade-500 border-jade-500/20 bg-jade-500/10"
                : "text-solar-500 border-solar-500/20 bg-solar-500/10"
            }`}>
              {status === "generated" ? "● Ready" : <Loader2 className="w-3 h-3 animate-spin" />}
              {status}
            </div>

            <button
              onClick={handleExportHtml}
              title="Download standalone HTML file"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3 h-3 text-cobalt-600 dark:text-cobalt-400" />
              Export
            </button>

            <button
              onClick={() => window.print()}
              title="Print or Save as PDF"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
            >
              <Printer className="w-3 h-3 text-marine-500" />
              PDF
            </button>

            <button
              onClick={handleRegenerateLesson}
              disabled={isBusy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-cobalt-500" />
              Rebuild
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Surface — Constrained cleanly to max-w-[940px] to prevent width mismatch */}
      <div className="w-full max-w-[940px] mx-auto px-4 sm:px-6">
        {status === "generating" ? (
          <div className="py-12">
            <GeneratingTelemetryVisualizer pipeline={null} topicTitle={outline || title} />
          </div>
        ) : (compile_error || !ts_code) ? (
          <div className="glass-card p-12 border-red-500/20 bg-red-500/5 my-8">
            <div className="flex items-center gap-3 text-red-500 mb-6 font-black text-xl">
              <ShieldAlert className="w-6 h-6" />
              Lesson Generation Notice
            </div>
            <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
              We encountered an issue preparing <strong>&ldquo;{outline}&rdquo;</strong>.
            </p>
            <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-red-500/20 font-mono text-sm text-red-400 overflow-x-auto shadow-inner">
              {compile_error || "ts_code is missing."}
            </div>
            <button 
              onClick={handleRegenerateLesson} 
              disabled={isBusy}
              className="px-8 py-3.5 bg-cobalt-600 text-white rounded-xl font-bold hover:bg-cobalt-500 transition-all shadow-xl shadow-cobalt-600/20 flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Rebuild Lesson
            </button>
          </div>
        ) : viewMode === "document" ? (
          <LessonDocumentView
            document={extractLessonDocument(title, outline, ts_code)}
            rawTsCode={ts_code}
          />
        ) : (
          <>
            {/* Live React Component Execution */}
            <div className="w-full">
              <LessonRunner
                key={ts_code}
                code={ts_code}
                onRuntimeError={(error) => {
                  if (error.message !== runtimeError && error.message !== lastRepairAttempt) {
                    setRuntimeError(error.message);
                  }
                }}
              />
            </div>

            {/* Repair & Source Code Inspector Section */}
            <div className="w-full pb-16">
              {runtimeError && (
                <div className="mt-8 glass-card p-6 sm:p-8 border-solar-500/30 bg-solar-500/5 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-2.5 text-solar-500 mb-3 font-black text-sm">
                    <Wrench className="w-4 h-4" /> Simulation Preview Notice
                  </div>
                  <pre className="bg-slate-900 p-4 rounded-xl text-solar-300 font-mono text-xs mb-5 overflow-x-auto whitespace-pre-wrap border border-solar-500/20">{runtimeError}</pre>
                  
                  {repairAttempts < 2 ? (
                    <button 
                      onClick={handleRepairLesson} 
                      disabled={isBusy}
                      className="px-6 py-2.5 bg-solar-500 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-solar-400 transition-all shadow-md shadow-solar-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Wrench className="w-4 h-4" /> Auto-Fix Issue ({2 - repairAttempts} attempts left)
                    </button>
                  ) : (
                    <button 
                      onClick={handleRegenerateLesson} 
                      disabled={isBusy}
                      className="px-6 py-2.5 bg-cobalt-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-cobalt-500 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Rebuild Lesson
                    </button>
                  )}
                </div>
              )}

              <div className="mt-10 text-center">
                <button 
                  onClick={() => setShowRawCode(!showRawCode)}
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-cobalt-600 dark:hover:text-white transition-all uppercase tracking-widest cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  {showRawCode ? "Hide Code" : "View Lesson Code"}
                </button>
                {showRawCode && (
                  <div className="mt-5 text-left glass-card p-6 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-900/90 dark:bg-slate-950 overflow-x-auto border border-slate-200 dark:border-slate-800 shadow-inner rounded-xl">
                    <pre className="whitespace-pre-wrap break-words">{ts_code}</pre>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="max-w-[940px] mx-auto px-4 sm:px-6 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
        <div>LessonCrafter · Interactive Learning Platform</div>
        <div>Explore concepts through hands-on simulations</div>
      </footer>

      {/* Study Assistant Sidecar Drawer */}
      <SocraticTutorDrawer lessonTitle={title || outline} lessonOutline={outline} />
    </main>
  );
}