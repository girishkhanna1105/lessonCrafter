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

  // fetch the lesson from Supabase
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

  // export to PDF
  const exportPDF = () => {
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold");
    pdf.text(lesson.title, 10, 15);
    pdf.setFont("helvetica", "normal");
    pdf.text(lesson.summary, 10, 25);

    let y = 40;
    lesson.content_json.sections.forEach((sec: any) => {
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

  const content = lesson.content_json;

  return (
    <main className="min-h-screen bg-[#0b0b13] text-gray-100 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-gray-400 hover:text-indigo-400 transition"
        >
          ← Back
        </button>

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-2">
          {content.title}
        </h1>
        <p className="text-gray-400 mb-8">{content.summary}</p>

        {/* Sections */}
        <div className="space-y-10">
          {content.sections?.map((section: any, idx: number) => (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden border border-[#2d2d4a] shadow-md"
              style={{ background: section.color || "#1b1b28" }}
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-indigo-300 mb-3">
                  {section.heading}
                </h2>
                <p className="text-gray-200 leading-relaxed mb-4">
                  {section.body}
                </p>

                {section.code && (
                  <div className="rounded-lg overflow-hidden mt-4">
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
                  <div className="mt-4">
                    <div className="text-xs text-gray-400 mb-1">
                      Image prompt: {section.imagePrompt}
                    </div>
                    <div className="w-full h-48 bg-[#111122] flex items-center justify-center text-gray-600 italic rounded-xl border border-[#2a2a44]">
                      [AI Image: “{section.imagePrompt}”]
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quiz */}
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

        {/* Export */}
        <div className="text-center mt-10">
          <button
            onClick={exportPDF}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2 rounded-lg hover:opacity-90 font-semibold"
          >
            Export as PDF 📄
          </button>
        </div>
      </div>
    </main>
  );
}
