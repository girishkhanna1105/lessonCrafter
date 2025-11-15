"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // --- Functions are unchanged ---

  // 🧠 Fetch all lessons from Supabase
  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLessons(data);
  };

  // ⚡ Generate new lesson
  const addLesson = async () => {
    if (!outline.trim()) return;
    setLoading(true);

    // 1️⃣ Create a new entry in Supabase
    const { data, error } = await supabase
      .from("lessons")
      .insert([{ outline, title: outline, status: "generating" }])
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase insert failed:", error);
      setLoading(false);
      return;
    }

    // 2️⃣ Call your AI route (Groq API)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: data.id, outline }),
      });

      const result = await response.json();
      console.log("Lesson generation result:", result);
    } catch (err) {
      console.error("AI generation failed:", err);
    }

    // 3️⃣ Refresh lessons
    await fetchLessons();
    setOutline("");
    setLoading(false);
  };

  // Fetch lessons on page load
  useEffect(() => {
    fetchLessons();
  }, []);

  // --- NEW RENDER BLOCK ---

  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-gray-100">

      {/* --- LEFT SIDEBAR (Lessons List) --- */}
      <aside className="w-full lg:w-1/3 xl:w-1/4 lg:h-screen lg:overflow-y-auto lg:border-r border-[#2d2d4a] py-6 lg:py-8 lg:order-1 order-2">
        
        <h2 className="text-2xl font-bold text-gray-200 px-6 lg:px-8 mb-3">
          Generated Lessons
        </h2>

        {lessons.length === 0 ? (
          // Empty state (with padding)
          <div className="rounded-2xl border border-[#2a2a44] bg-[#151523]/70 p-10 mx-6 lg:mx-8">
            <p className="text-gray-500 italic text-center">
              No lessons yet. Generate one to see it here ✨
            </p>
          </div>
        ) : (
          // Table (flush with no horizontal padding)
          <div className="overflow-hidden rounded-2xl border-x-0 border-y border-[#2a2a44] bg-[#151523]/70 backdrop-blur-lg shadow-inner">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#1c1c2c] text-gray-300">
                <tr>
                  {/* NEW: Reduced padding (px-4) */}
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  {/* NEW: Reduced padding (px-4) */}
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-t border-[#2424a] hover:bg-[#1d1d2e]/70 transition"
                  >
                    {/* NEW: Reduced padding (px-4) */}
                    <td className="px-4 py-3">
                      <button
                        className={`w-full text-left font-medium transition-colors ${
                          lesson.status === "generated"
                            ? "text-gray-200 hover:text-indigo-300"
                            : "text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={lesson.status !== "generated"}
                        onClick={() => router.push(`/lessons/${lesson.id}`)}
                      >
                        {lesson.title}
                      </button>
                    </td>

                    {/* NEW: Reduced padding (px-4) */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          lesson.status === "generated"
                            ? "bg-green-500/10 text-green-400 border border-green-400/20"
                            : lesson.status === "error"
                            ? "bg-red-500/10 text-red-400 border border-red-400/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-400/20"
                        }`}
                      >
                        {lesson.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <footer className="text-center pt-10 text-sm text-gray-500 px-6 lg:px-8 mt-6">
          Made with 💜 by Girish | Powered by Supabase + Groq + Next.js
        </footer>
      </aside>

      {/* --- MAIN CONTENT (Generator) --- */}
      {/* This section is unchanged */}
      <main className="flex-1 min-h-[70vh] lg:h-screen flex flex-col justify-center items-center p-6 lg:p-10 lg:order-2 order-1">
        
        {/* Wrapper for intro + card */}
        <div className="max-w-xl w-full">

          {/* Intro Section */}
          <div className="text-center mb-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4 tracking-tight">
              LessonCrafter 🚀
            </h1>
            <p className="text-xl text-gray-400">
              Generate interactive AI-powered lessons from simple outlines.
            </p>
          </div>
          
          {/* Generator Card */}
          <div className="bg-[#151523]/60 backdrop-blur-xl border border-[#2d2d4a] rounded-2xl shadow-[0_0_25px_rgba(88,88,255,0.15)] p-8 transition hover:shadow-[0_0_35px_rgba(88,88,255,0.25)]">
            
            <div className="mb-6">
              <label
                htmlFor="outline"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Lesson Outline
              </label>
              <textarea
                id="outline"
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                placeholder='e.g. "A beginner’s guide to Neural Networks"'
                className="w-full bg-[#1b1b28] border border-[#333355] rounded-xl p-3 h-28 resize-none text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            <button
              onClick={addLesson}
              disabled={loading}
              className={`w-full py-3 font-semibold rounded-xl transition ${
                loading
                  ? "bg-indigo-700/50 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90"
              }`}
            >
              {loading ? "Generating..." : "Generate Lesson"}
            </button>
          </div>
        </div>
      </main>
      
    </main>
  );
}