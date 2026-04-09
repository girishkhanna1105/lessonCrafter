// app/lessons/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LessonRunner from "@/components/LessonRunner";
import { ChevronLeft, RotateCcw, ShieldAlert, Code2, Loader2, Wrench } from "lucide-react";
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

  const [lesson, setLesson]  = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRawCode, setShowRawCode] = useState(false);
  
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastRepairAttempt, setLastRepairAttempt] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, outline, ts_code, compile_error, status")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setLesson(data);
      } else {
        console.error("❌ Fetch error:", error);
        setLesson(null);
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id, supabase]);

  const handleRepairLesson = async () => {
    if (!runtimeError || !lesson || !lesson.ts_code || isRepairing) return;
    if (runtimeError === lastRepairAttempt) return;
    
    setIsRepairing(true);
    setLastRepairAttempt(runtimeError);

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

  if (loading)
    return (
      <main className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Summoning Lesson Library...</p>
        </div>
      </main>
    );

  if (!lesson)
    return (
      <main className="flex flex-col justify-center items-center min-h-screen bg-background px-6">
        <div className="glass-card p-12 text-center max-w-lg">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-gray-400 mb-8">The lesson you're looking for might have been deleted or moved.</p>
          <button
            onClick={() => router.push("/page2")}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all active:scale-95"
          >
            Return to Generator
          </button>
        </div>
      </main>
    );

  const { title, ts_code, compile_error, status, outline } = lesson;
  const isBusy = isRepairing || isRegenerating;

  return (
    <main className="min-h-screen bg-background relative pb-20">
      <Navbar />
      
      {/* 🧬 Busy Overlay */}
      {isBusy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex flex-col justify-center items-center px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
            <Loader2 className="animate-spin w-16 h-16 text-indigo-500 mb-8 relative z-10" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 text-center">
            {isRepairing ? "Auto-Repairing Artifacts" : "Regenerating Knowledge"}
          </h2>
          <p className="text-gray-400 font-medium text-center">Our AI is re-weaving the educational tapestry. Please hold.</p>
        </div>
      )}

      {/* 📘 Slim nav bar — back button + action buttons only, no duplicate title */}
      <div className="pt-24 pb-4 px-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => router.push("/page2")}
            className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO LIBRARY
          </button>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${
              status === "generated"
                ? "text-green-400 border-green-400/20 bg-green-400/5"
                : "text-amber-400 border-amber-400/20 bg-amber-400/5"
            }`}>
              {status === "generated" ? <RotateCcw className="w-3 h-3" /> : <Loader2 className="w-3 h-3 animate-spin" />}
              {status}
            </div>

            <button
              onClick={handleRegenerateLesson}
              disabled={isBusy}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 hover:border-white/30 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" />
              Regenerate
            </button>
          </div>
        </div>
      </div>


      {/* 🧠 Lesson Surface — full width, no container constraints */}
      <div className="w-full">
        {status === "generating" ? (
          <div className="mx-6 glass-card p-20 text-center flex flex-col items-center justify-center border-indigo-500/20 bg-indigo-500/5">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4">Crafting Your Lesson</h2>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              Our AI is currently weaving together educational theory, interactive components, and quizzes for:
              <span className="block mt-2 text-indigo-300 font-bold italic">"{outline}"</span>
            </p>
            <div className="mt-8 flex gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (compile_error || !ts_code) ? (
          <div className="mx-6 glass-card p-12 border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-3 text-red-400 mb-6 font-black text-xl">
              <ShieldAlert className="w-6 h-6" />
              CRITICAL BUILD ERROR
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Generation failed for <strong>"{outline}"</strong>.
            </p>
            <div className="bg-black/60 rounded-2xl p-6 mb-8 border border-red-500/10 font-mono text-sm text-red-300 overflow-x-auto shadow-inner">
              {compile_error || "ts_code is missing."}
            </div>
            <button onClick={handleRegenerateLesson} disabled={isBusy}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
              <RotateCcw className="w-5 h-5" /> Attempt Full Re-generation
            </button>
          </div>
        ) : (
          <>
            {/* Lesson renders full-width, no box/card */}
            <LessonRunner
              key={ts_code}
              code={ts_code}
              onRuntimeError={(error) => {
                if (error.message !== runtimeError && error.message !== lastRepairAttempt) {
                  setRuntimeError(error.message);
                }
              }}
            />

            {/* 🛠 Repair + Debug — back in a contained section */}
            <div className="max-w-4xl mx-auto px-6 pb-16">
              {runtimeError && (
                <div className="mt-8 glass-card p-8 border-amber-500/30 bg-amber-500/5 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 text-amber-400 mb-4 font-black">
                    <Wrench className="w-5 h-5" /> RUNTIME ANOMALY DETECTED
                  </div>
                  <pre className="bg-black/40 p-4 rounded-xl text-amber-200/80 font-mono text-xs mb-6 overflow-x-auto whitespace-pre-wrap border border-amber-500/10">{runtimeError}</pre>
                  <button onClick={handleRepairLesson} disabled={isBusy}
                    className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20 active:scale-95 disabled:opacity-50">
                    <Wrench className="w-4 h-4" /> Deploy Auto-Fix Bot
                  </button>
                </div>
              )}
              <div className="mt-10 text-center">
                <button onClick={() => setShowRawCode(!showRawCode)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-white transition-all uppercase tracking-[0.2em]">
                  <Code2 className="w-3 h-3" />
                  {showRawCode ? "Hide Source" : "Inspect Neural Source"}
                </button>
                {showRawCode && (
                  <div className="mt-6 text-left glass-card p-6 font-mono text-[11px] leading-relaxed text-gray-400 bg-black/40 overflow-x-auto border border-white/5 shadow-inner">
                    <pre className="whitespace-pre-wrap break-words">{ts_code}</pre>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="max-w-6xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
        <div>LessonCrafter v2.0 // Premium AI Engine</div>
        <div>Built with Gemini, Supabase & Next.js</div>
      </footer>
    </main>
  );
}