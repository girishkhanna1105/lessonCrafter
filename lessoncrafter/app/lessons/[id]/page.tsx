// app/lessons/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LessonRunner from "@/components/LessonRunner";

// Keep your Lesson interface (unchanged)
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
  
  // --- NEW & UPDATED STATE ---
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  // Used to prevent infinite repair loops
  const [lastRepairAttempt, setLastRepairAttempt] = useState<string | null>(null);
  // ---------------------------

  // useEffect (Unchanged)
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
        setLesson(null); // Ensure lesson is null on error
      }
      setLoading(false);
    };
    fetchLesson();
  }, [id, supabase]);

  // --- UPDATED: Auto-Repair Handler ---
  const handleRepairLesson = async () => {
    if (!runtimeError || !lesson || !lesson.ts_code || isRepairing) return;

    // Prevent infinite loop
    if (runtimeError === lastRepairAttempt) {
      console.warn("Skipping repair: same error as last attempt.");
      return;
    }
    
    setIsRepairing(true);
    setLastRepairAttempt(runtimeError); // Log this error attempt

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

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Repair API request failed");
      }

      const result = await response.json();

      if (result.success && result.repairedCode) {
        // SUCCESS! Load the new code.
        setLesson({ 
          ...lesson, 
          ts_code: result.repairedCode, 
          compile_error: null,
          status: 'generated' 
        });
        setRuntimeError(null); // Clear the error, we're fixed!
      } else {
        // Repair failed, show the error
        setRuntimeError(`Repair attempt failed: ${result.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setRuntimeError(`Repair request failed: ${err.message}`);
    } finally {
      setIsRepairing(false);
    }
  };
  
  // --- NEW: Manual Regenerate Handler ---
  const handleRegenerateLesson = async () => {
    if (!lesson || isRegenerating || isRepairing) return;

    setIsRegenerating(true);
    setRuntimeError(null); // Clear any errors
    setLastRepairAttempt(null); // Reset repair loop prevention

    try {
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lesson.id,
          outline: lesson.outline,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Regenerate API request failed");
      }

      const result = await response.json();

      if (result.success && result.generatedCode) {
        // SUCCESS! Load the new code.
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
  // -------------------------------------------


  // Loading state (Unchanged)
  if (loading)
    return (
      <main className="flex justify-center items-center min-h-screen bg-[#0b0b13] text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading lesson...</p>
        </div>
      </main>
    );

  // Lesson not found (Unchanged)
  if (!lesson)
    return (
      <main className="flex flex-col justify-center items-center min-h-screen bg-[#0b0b13] text-red-400">
        <p className="text-xl mb-4">Lesson not found 😭</p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          ← Go Back
        </button>
      </main>
    );

  const { title, ts_code, compile_error, status, outline } = lesson;
  const isBusy = isRepairing || isRegenerating;

  // -----------------------------------------------------------------
  // ✅ UPDATED RENDER LOGIC
  // -----------------------------------------------------------------
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0b13] via-[#0d0d18] to-[#0a0a12] text-gray-100 px-6 py-10 relative">
      
      {/* --- NEW: Busy Overlay --- */}
      {isBusy && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-200">
            {isRepairing ? "Attempting Auto-Repair..." : "Regenerating Lesson..."}
          </p>
          <p className="text-gray-400">Please wait, AI is at work ✨</p>
        </div>
      )}

      {/* 📙 Header (with new Regenerate button) */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.push("/")}
            disabled={isBusy}
            className="text-sm text-gray-400 hover:text-indigo-400 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 flex-1 text-center truncate px-4">
            {title || "Interactive Lesson"}
          </h1>
          
          {/* Action Buttons Container */}
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-3 py-1 rounded-full border ${
                status === "generated"
                  ? "text-green-400 border-green-400/30 bg-green-400/10"
                  : status === "error"
                  ? "text-red-400 border-red-400/30 bg-red-400/10"
                  : "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
              }`}
            >
              {status}
            </span>

            {/* --- NEW: Regenerate Button --- */}
            <button
              onClick={handleRegenerateLesson}
              disabled={isBusy}
              className="text-xs px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate a new lesson from the same outline"
            >
              🔄 Regenerate
            </button>
          </div>

        </div>
      </div>

      {/* 🧠 Lesson Content */}
      <div className="w-full">
        {(compile_error || !ts_code) ? (
          // Build Error State
          <div className="max-w-6xl mx-auto p-8 border border-red-500/30 rounded-2xl bg-red-500/10 backdrop-blur-md shadow-lg">
            <h2 className="text-red-400 text-xl font-semibold mb-3">
              ❌ Build Failed
            </h2>
            <p className="text-gray-300 text-sm mb-2">
              The AI failed to generate valid code for: <strong>{outline}</strong>
            </p>
            <p className="text-gray-400 text-xs mb-4">Error details:</p>
            <pre className="text-red-300 text-sm whitespace-pre-line font-mono bg-red-950/30 p-4 rounded-lg">
              {compile_error ||
                "Unknown issue: The lesson code (ts_code) is missing."}
            </pre>
            <button
              onClick={handleRegenerateLesson} // Allow regenerating from a failed build
              disabled={isBusy}
              className="mt-6 px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isRegenerating ? "Regenerating..." : "🔄 Try Regenerating Lesson"}
            </button>
          </div>
        ) : (
          // Success State (Code exists)
          <>
            <div className="w-full">
              <LessonRunner 
                key={ts_code} // Force re-mount when code changes
                code={ts_code}
                onRuntimeError={(error) => {
                  console.error("Runtime error caught in page:", error.message);
                  // Set runtime error *only if* it's a new error
                  if (error.message !== runtimeError && error.message !== lastRepairAttempt) {
                    setRuntimeError(error.message);
                  }
                }}
              />
            </div>

            {/* --- UPDATED: Runtime Error Repair UI --- */}
            {runtimeError && (
              <div className="max-w-6xl mx-auto mt-6 p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300">
                <h3 className="text-xl font-bold mb-2">⚠️ Runtime Error Detected</h3>
                <pre className="text-sm text-red-200 whitespace-pre-wrap font-mono mb-4 bg-red-950/30 p-3 rounded-md">
                  {runtimeError}
                </pre>
                <button
                  onClick={handleRepairLesson}
                  disabled={isBusy}
                  className="px-5 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRepairing ? "Fixing..." : "🤖 Attempt Auto-Repair"}
                </button>
              </div>
            )}

            {/* Debug Toggle & Raw Code */}
            <div className="max-w-6xl mx-auto">
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowRawCode(!showRawCode)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition underline"
                >
                  {showRawCode ? "Hide" : "Show"} Raw Code (Debug)
                </button>
              </div>

              {showRawCode && (
                <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto max-w-full">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {ts_code}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 🦶 Footer (Unchanged) */}
      <footer className="max-w-6xl mx-auto text-center text-gray-500 text-sm mt-12">
        Made with 💜 by Girish | Powered by Gemini + Supabase + Next.js
      </footer>
      
    </main>
  );
}