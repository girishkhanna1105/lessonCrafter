"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import jsPDF from "jspdf";

export default function LessonView() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<any>(null);
  const supabase = createClient();

  // Fetch lesson
  const fetchLesson = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", id)
      .single();
    if (!error && data) setLesson(data);
  };

  useEffect(() => {
    fetchLesson();
  }, []);

  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.text(lesson.title, 10, 15);
    pdf.setFont("helvetica", "normal");
    pdf.text(lesson.summary, 10, 25);

    let y = 40;
    lesson.content_json?.sections?.forEach((sec: any) => {
      pdf.text(sec.heading, 10, y);
      y += 10;
      const split = pdf.splitTextToSize(sec.body, 180);
      pdf.text(split, 10, y);
      y += split.length * 7 + 10;
    });

    pdf.save(`${lesson.title}.pdf`);
  };

  if (!lesson)
    return (
      <main className="flex items-center justify-center min-h-screen text-gray-400">
        Loading lesson...
      </main>
    );

  const content =
    lesson.content_json && Object.keys(lesson.content_json).length
      ? lesson.content_json
      : {
          title: lesson.title,
          summary: "Lesson content not yet generated.",
          sections: [],
          quiz: [],
        };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0b0b13] via-[#0d0d18] to-[#0a0a12] text-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="bg-[#151523]/70 backdrop-blur-lg border border-[#2d2d4a] rounded-3xl p-8 shadow-[0_0_35px_rgba(88,88,255,0.1)] mb-12 text-center">
          <button
            onClick={() => router.push("/")}
            className="absolute top-6 left-6 text-sm text-gray-400 hover:text-indigo-400 transition"
          >
            ← Back
          </button>

          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-3">
            {content.title}
          </h1>
          <p className="text-gray-400 text-lg">{content.summary}</p>
        </div>

        {/* Section Cards */}
        <div className="space-y-10">
          {content.sections?.map((section: any, idx: number) => (
            <div
              key={idx}
              className="relative overflow-hidden border border-[#2a2a44]/60 rounded-3xl shadow-lg backdrop-blur-xl"
              style={{
                background: `linear-gradient(135deg, ${section.color || "#1c1c2e"}33 0%, #0e0e18 100%)`,
              }}
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4 text-indigo-300">
                  {section.heading}
                </h2>

                <p className="text-gray-200 leading-relaxed mb-6 whitespace-pre-line">
                  {section.body}
                </p>

                {section.code && (
                  <div className="rounded-lg overflow-hidden border border-[#333355]/70 shadow-inner">
                    <SyntaxHighlighter
                      language={section.lang || "javascript"}
                      style={oneDark}
                      showLineNumbers
                    >
                      {section.code}
                    </SyntaxHighlighter>
                  </div>
                )}

                {section.imagePrompt && (
                  <div className="mt-6">
                    <div className="text-xs text-gray-500 mb-2">
                      AI Image: {section.imagePrompt}
                    </div>
                    <div className="w-full h-52 rounded-2xl border border-[#333355] bg-[#111122] flex items-center justify-center italic text-gray-500">
                      [Image placeholder for "{section.imagePrompt}"]
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quiz Section */}
         {content.quiz && content.quiz.length > 0 && (
          <div className="mt-12 bg-[#151523]/70 border border-[#2a2a44] rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Quiz 🧠</h2>
            {content.quiz.map((q: any, i: number) => (
              <div key={i} className="mb-6">
                <p className="font-semibold mb-2">
                  {i + 1}. {q.question}
                </p>
                <ul className="space-y-2">
                  {q.options.map((opt: string, idx: number) => (
                    <li
                      key={idx}
                      className="cursor-pointer bg-[#1b1b28] border border-[#333355] hover:bg-[#222236] px-4 py-2 rounded transition"
                      onClick={(e) => {
                        const el = e.currentTarget;
                        if (opt === q.answer) {
                          el.classList.add("bg-green-500/20");
                        } else {
                          el.classList.add("bg-red-500/20");
                        }
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Export Button */}
        <div className="text-center mt-12">
          <button
            onClick={exportPDF}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-all"
          >
            Export Lesson as PDF 📄
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12">
          Made with 💜 by Girish | Powered by Groq + Supabase + Next.js
        </footer>
      </div>
    </main>
  );
}
