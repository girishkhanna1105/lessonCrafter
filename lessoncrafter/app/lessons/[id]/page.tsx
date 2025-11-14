"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LessonRunner from "@/components/LessonRunner";

export default function LessonViewer() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRawCode, setShowRawCode] = useState(false);

  // 🧩 Fetch lesson data from Supabase
  useEffect(() => {
    const fetchLesson = async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        console.log("📦 Fetched lesson:", data);
        setLesson(data);
      } else {
        console.error("❌ Fetch error:", error);
      }
      setLoading(false);
    };

    fetchLesson();
  }, [id]);

  // 🍕 Loading state
  if (loading)
    return (
      <main className="flex justify-center items-center min-h-screen bg-[#0b0b13] text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p>Loading lesson...</p>
        </div>
      </main>
    );

  // ❌ Lesson not found
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

  const { title, ts_code, compile_error, status } = lesson;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0b13] via-[#0d0d18] to-[#0a0a12] text-gray-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* 📙 Header */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-gray-400 hover:text-indigo-400 transition flex items-center gap-2"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 flex-1 text-center">
            {title || "Interactive Lesson"}
          </h1>
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
        </div>

        {/* 🧠 Lesson Content */}
        {compile_error || !ts_code ? (
          <div className="p-8 border border-red-500/30 rounded-2xl bg-red-500/10 backdrop-blur-md shadow-lg">
            <h2 className="text-red-400 text-xl font-semibold mb-3">
              ❌ Build Failed
            </h2>
            <p className="text-gray-300 text-sm whitespace-pre-line">
              {compile_error ||
                "Unknown issue occurred while compiling the lesson."}
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              ← Try Another Lesson
            </button>
          </div>
        ) : (
          <>
            {/* ✅ Live-render the AI-generated TSX lesson - NO WRAPPER! */}
            <div className="w-full">
              <LessonRunner code={ts_code} />
            </div>

            {/* Debug Toggle */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setShowRawCode(!showRawCode)}
                className="text-xs text-gray-500 hover:text-gray-300 transition underline"
              >
                {showRawCode ? "Hide" : "Show"} Raw Code (Debug)
              </button>
            </div>

            {/* Raw Code Display */}
            {showRawCode && (
              <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-xl overflow-x-auto max-w-full">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                  {ts_code}
                </pre>
              </div>
            )}
          </>
        )}

        <footer className="text-center text-gray-500 text-sm mt-12">
          Made with 💜 by Girish | Powered by Groq + Supabase + Next.js
        </footer>
      </div>
    </main>
  );
}