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

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#111122] to-[#0a0a0f] text-gray-100 px-6 py-10">
      <div className="max-w-3xl mx-auto bg-[#151523]/60 backdrop-blur-xl border border-[#2d2d4a] rounded-2xl shadow-[0_0_25px_rgba(88,88,255,0.15)] p-8 transition hover:shadow-[0_0_35px_rgba(88,88,255,0.25)]">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4 text-center tracking-tight">
          LessonCrafter 🚀
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Generate interactive AI-powered lessons from simple outlines.
        </p>

        {/* Lesson Form */}
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

      {/* Lessons Table */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          Generated Lessons
        </h2>

        {lessons.length === 0 ? (
          <p className="text-gray-500 italic text-center">
            No lessons yet. Start crafting one ✨
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#2a2a44] bg-[#151523]/70 backdrop-blur-lg shadow-inner">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#1c1c2c] text-gray-300">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-t border-[#24243a] hover:bg-[#1d1d2e]/70 transition"
                  >
                    <td className="px-4 py-3 font-medium text-gray-200">
                      {lesson.title}
                    </td>
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
                    <td className="px-4 py-3">
                      <button
                        className={`font-medium ${
                          lesson.status === "generated"
                            ? "text-indigo-400 hover:text-indigo-300 hover:underline"
                            : "text-gray-600 cursor-not-allowed"
                        }`}
                        disabled={lesson.status !== "generated"}
                        onClick={() => router.push(`/lessons/${lesson.id}`)}
                      >
                        View Lesson →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="text-center mt-10 text-sm text-gray-500">
        Made with 💜 by Girish | Powered by Supabase + Groq + Next.js
      </footer>
    </main>
  );
}
