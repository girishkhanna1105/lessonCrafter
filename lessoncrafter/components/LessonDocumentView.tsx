"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Lightbulb, 
  AlertTriangle, 
  Award, 
  Compass, 
  Printer, 
  Download, 
  ChevronRight,
  FileText,
  Target
} from "lucide-react";
import { StructuredLessonDocument } from "@/lib/extractLessonDocument";

interface LessonDocumentViewProps {
  document: StructuredLessonDocument;
  rawTsCode?: string | null;
}

export default function LessonDocumentView({
  document,
  rawTsCode,
}: LessonDocumentViewProps) {
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});

  const toggleReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportText = () => {
    const textContent = `
================================================================================
${document.title.toUpperCase()}
[Subject: ${document.subject} | Level: ${document.level}]
================================================================================

LEARNING OBJECTIVES:
${document.objectives.map((o, i) => `[${i + 1}] ${o}`).join("\n")}

${document.intuitiveAnchor ? `INTUITIVE ANCHOR:\n"${document.intuitiveAnchor}"\n` : ""}
EXECUTIVE INTRODUCTION:
${document.introduction}

${document.sections.map((s, idx) => `
--------------------------------------------------------------------------------
SECTION ${idx + 1}: ${s.title}
--------------------------------------------------------------------------------
${s.explanation}

KEY TAKEAWAYS:
${s.keyPoints.map((k) => `  * ${k}`).join("\n")}

${s.misconception ? `MISCONCEPTION ALERT:\n  ! ${s.misconception}\n` : ""}
${s.example ? `REAL-WORLD APPLICATION:\n  > ${s.example}\n` : ""}
`).join("\n")}

--------------------------------------------------------------------------------
FORMATIVE ASSESSMENT & DIAGNOSTIC REVIEW
--------------------------------------------------------------------------------
${document.quiz.map((q, i) => `
Q${i + 1}: ${q.question}
${q.options.map((opt, oIdx) => `   [${String.fromCharCode(65 + oIdx)}] ${opt} ${oIdx === q.correctIndex ? "(CORRECT)" : ""}`).join("\n")}
Rationale: ${q.explanation}
`).join("\n")}

--------------------------------------------------------------------------------
SUMMARY
--------------------------------------------------------------------------------
${document.summary}

================================================================================
Generated with LessonCrafter
================================================================================
`.trim();

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = `${document.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_courseware.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="max-w-[940px] mx-auto px-4 sm:px-6 py-10 space-y-10 font-sans print:p-0 print:m-0 print:max-w-full">
      
      {/* Top Utility Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
          <FileText className="w-4 h-4 text-cobalt-500" />
          <span>READING VIEW</span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-emerald-500 font-semibold">Ready to Study</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cobalt-500/40 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cobalt-500" />
            <span>Export Text</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md shadow-cobalt-600/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Document</span>
          </button>
        </div>
      </div>

      {/* Document Header Cover */}
      <header className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-8 print:border-black print:pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 border border-cobalt-500/20 print:border-black print:text-black">
            {document.subject}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 print:text-black">
            {document.level}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 print:hidden">
            Estimated Study: 15–20 Mins
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight print:text-black print:text-3xl">
          {document.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal print:text-black">
          {document.introduction}
        </p>
      </header>

      {/* Intuitive Anchor Callout */}
      {document.intuitiveAnchor && (
        <section className="p-6 rounded-2xl bg-gradient-to-r from-cobalt-500/10 via-marine-500/10 to-transparent border border-cobalt-500/30 print:border-black print:bg-none print:p-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 mb-2 print:text-black">
            <Compass className="w-4 h-4 text-cobalt-500 print:hidden" />
            <span>Intuitive Mental Anchor & Physical Analogy</span>
          </div>
          <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 font-medium leading-relaxed italic print:text-black">
            &ldquo;{document.intuitiveAnchor}&rdquo;
          </p>
        </section>
      )}

      {/* Learning Objectives Matrix */}
      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 print:text-black">
          <Target className="w-3.5 h-3.5 text-cobalt-500 print:hidden" />
          <span>Core Competencies & Objectives</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:grid-cols-1">
          {document.objectives.map((obj, i) => (
            <div 
              key={i} 
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none flex items-start gap-3"
            >
              <span className="w-5 h-5 rounded-full bg-cobalt-500/20 text-cobalt-600 dark:text-cobalt-300 text-xs font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5 print:text-black">
                0{i + 1}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed print:text-black">
                {obj}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum Sections */}
      <section className="space-y-10">
        {document.sections.map((section, idx) => (
          <div 
            key={idx} 
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none print:p-0 print:space-y-3 space-y-6 shadow-sm print:break-inside-avoid"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-cobalt-600 dark:text-cobalt-400 print:text-black">
                MODULE {idx + 1}
              </span>
              <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 print:hidden" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white print:text-black">
              {section.title}
            </h3>

            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal print:text-black">
              {section.explanation}
            </p>

            {/* Hierarchical Subsections */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="space-y-4 pt-2">
                {section.subsections.map((sub, sIdx) => (
                  <div 
                    key={sIdx} 
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm print:border-black print:bg-none"
                  >
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white print:text-black">
                      {sub.title}
                    </h4>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line print:text-black font-normal">
                      {sub.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Takeaways */}
            {section.keyPoints && section.keyPoints.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 print:border-black print:bg-none space-y-2">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-black">
                  Key Principles & Takeaways
                </div>
                <ul className="space-y-2">
                  {section.keyPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium print:text-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5 print:text-black" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Misconception Callout Alert */}
            {section.misconception && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 print:border-black print:bg-none flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5 print:hidden" />
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 print:text-black">
                    Common Misconception & Mental Trap
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed font-medium print:text-black">
                    {section.misconception}
                  </p>
                </div>
              </div>
            )}

            {/* Real World Analogy / Application */}
            {section.example && (
              <div className="p-4 rounded-xl bg-cobalt-500/5 border-l-4 border-l-cobalt-500 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-cobalt-500 flex-shrink-0 mt-0.5 print:hidden" />
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-cobalt-600 dark:text-cobalt-400 print:text-black">
                    Real-World Manifestation
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed print:text-black">
                    {section.example}
                  </p>
                </div>
              </div>
            )}

            {/* Code / Formula Block */}
            {section.codeSnippet && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto print:border-black print:text-black print:bg-none">
                <pre className="whitespace-pre-wrap">{section.codeSnippet}</pre>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Worked Example Problem Analysis */}
      {document.workedExample && (
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-100/90 dark:bg-slate-900/60 border border-cobalt-500/30 print:border-black print:bg-none print:p-0 space-y-6 print:break-inside-avoid">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cobalt-600 text-white print:border-black print:text-black">
              Worked Example
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white print:text-black">
            {document.workedExample.title}
          </h2>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-white/10 print:border-black print:bg-none">
            <div className="text-[11px] font-mono font-bold uppercase text-slate-400 mb-1">Problem Scenario</div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium print:text-black">
              {document.workedExample.scenario}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {document.workedExample.steps.map((st) => (
              <div key={st.step_number} className="p-4 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cobalt-600 dark:text-cobalt-400 print:text-black">
                  <span>STEP 0{st.step_number}</span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-700 dark:text-slate-300">{st.title}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed print:text-black">
                  {st.description}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200 leading-relaxed print:border-black print:text-black">
            <strong className="text-emerald-600 dark:text-emerald-400 mr-1.5">KEY TAKEAWAY:</strong>
            {document.workedExample.insight}
          </div>
        </section>
      )}

      {/* Formative Assessment / Diagnostic Review */}
      {document.quiz && document.quiz.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800 print:border-black print:break-inside-avoid">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-solar-500 print:hidden" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white print:text-black">
              Practice Questions & Solutions
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 print:text-black">
            Test and reinforce your conceptual understanding with targeted questions.
          </p>

          <div className="space-y-6">
            {document.quiz.map((q, qIdx) => (
              <div 
                key={qIdx}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cobalt-600 dark:text-cobalt-400 print:text-black">
                    QUESTION {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleReveal(qIdx)}
                    className="text-[11px] font-mono text-slate-500 hover:text-cobalt-500 transition-colors print:hidden cursor-pointer"
                  >
                    {revealedAnswers[qIdx] ? "Hide Solution" : "Show Solution & Explanation"}
                  </button>
                </div>

                <div className="text-sm font-bold text-slate-900 dark:text-white print:text-black">
                  {q.question}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === q.correctIndex;
                    const isRevealed = revealedAnswers[qIdx];
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                          isRevealed && isCorrect
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                            : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        } print:border-black print:text-black`}
                      >
                        <span className="font-mono font-bold mr-2">[{String.fromCharCode(65 + oIdx)}]</span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {(revealedAnswers[qIdx] || false) && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium print:block">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mr-1">EXPLANATION:</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Summary Footer */}
      <footer className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 print:border-black print:bg-none space-y-2">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 print:text-black">
          Summary & Key Insights
        </div>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed print:text-black">
          {document.summary}
        </p>
        <div className="pt-2 text-[10px] font-mono text-slate-400 print:text-black">
          Published with LessonCrafter · Interactive Learning Platform
        </div>
      </footer>

    </article>
  );
}
