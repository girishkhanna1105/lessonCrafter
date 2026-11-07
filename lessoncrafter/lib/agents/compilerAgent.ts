import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";
import { InteractiveOutput } from "./interactiveAgent";
import { QuizOutput } from "./quizAgent";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runCompilerAgent(
  content: LessonContent,
  interactive: InteractiveOutput,
  quiz: QuizOutput
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const workedExampleText = content.worked_example
    ? `
WORKED EXAMPLE:
Title: "${content.worked_example.title}"
Scenario: "${content.worked_example.scenario}"
Steps:
${content.worked_example.steps.map(s => `  Step ${s.step_number} [${s.title}]: ${s.description}`).join("\n")}
Insight: "${content.worked_example.insight}"
`
    : "";

  const prompt = `You are the Lead Educational Compiler Agent. Write a single, self-contained, instrument-grade React component that renders an extraordinary, in-depth interactive masterclass using react-live.

CRITICAL FORMAT RULES — MUST FOLLOW EXACTLY:
1. NO import statements at all (React, useState, useEffect, Lucide icons, etc. are already in scope)
2. NO export statements (no "export default", no "export function")
3. Must define exactly ONE main component called "LessonComponent" as: function LessonComponent() { ... }
4. The LAST LINE of the code MUST be: render(<LessonComponent />)
5. Use only inline styles with the style={{ ... }} prop — NO Tailwind className, NO external CSS classes
6. Available in scope:
   - React hooks: useState, useEffect, useRef, useMemo, useCallback
   - Dual-mode theme flag: isDark (boolean, true for dark mode, false for light mode)
   - Scope icons (render as <Sparkles style={{width:16,height:16}} />): Sparkles, Check, X, RotateCcw, ArrowRight, Play, Pause, BookOpen, Layers, Award, Sliders, Info, Lightbulb, Zap, CheckCircle2, AlertCircle, AlertTriangle, Target, Compass

LESSON DATA:
Title: "${content.title}"
Subject: "${content.subject}" | Level: "${content.level}"
Objectives: ${content.learning_objectives.join("; ")}
Introduction: "${content.introduction}"
${content.intuitive_anchor ? `Intuitive Anchor: "${content.intuitive_anchor}"` : ""}

SECTIONS:
${content.sections.map((s, i) => `
[Section ${i + 1}]: "${s.title}"
Overview: ${s.explanation}
${s.subsections && s.subsections.length > 0 ? s.subsections.map((sub, subIdx) => `  [Subsection ${i + 1}.${subIdx + 1}]: "${sub.title}"\n  ${sub.content}`).join("\n\n") : ""}
Key Points: ${s.key_points.join(" | ")}
${s.misconception_callout ? `Misconception Alert: "${s.misconception_callout}"` : ""}
Real-World Example: ${s.real_world_example}
${s.code_snippet ? `Formula/Code: ${s.code_snippet}` : ""}
`).join("\n")}

${workedExampleText}

INTERACTIVE ELEMENTS:
${interactive.elements.map((el, i) => `
[Interactive Module ${i + 1}]: "${el.description}"
Code blueprint: ${el.jsx_code}
`).join("\n")}

QUIZ:
${quiz.questions.map((q, i) => `
[Q${i + 1}]: "${q.question}"
Options: ${JSON.stringify(q.options)}
Correct Index: ${q.correct_index}
Explanation: "${q.explanation}"
`).join("\n")}

DESIGN & ARCHITECTURE DIRECTIVES:
1. DUAL-MODE PALETTE:
   At top of LessonComponent:
   const dark = typeof isDark !== 'undefined' ? isDark : true;
   const C = {
     bg: dark ? '#0a0f18' : '#f8fafc',
     card: dark ? '#111827' : '#ffffff',
     cardAlt: dark ? '#161f30' : '#f1f5f9',
     border: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
     borderHover: dark ? 'rgba(37,99,235,0.4)' : 'rgba(37,99,235,0.3)',
     text: dark ? '#f8fafc' : '#0f172a',
     textMuted: dark ? '#94a3b8' : '#64748b',
     cobalt: '#2563eb',
     electricCobalt: '#3b82f6',
     marine: '#06b6d4',
     solar: '#f59e0b',
     emerald: '#10b981',
     danger: '#ef4444'
   };

2. STRICT UNIFIED WIDTH & CARD ARCHITECTURE:
   CRITICAL CONSISTENT WIDTH RULE:
   - The master outer container and EVERY SINGLE card in the lesson MUST share the EXACT SAME WIDTH: maxWidth 920px!
   - NO card is allowed to be wider or narrower than any other card. Every card (Hero Banner, Interactive Lab, Section Cards 1..6, Worked Example, Quiz) must align perfectly to the exact same left and right edges.
   
   Define a unified card style at the top of LessonComponent:
   const cardStyle = {
     width: '100%',
     maxWidth: '920px',
     margin: '0 auto',
     background: C.card,
     border: '1px solid ' + C.border,
     borderRadius: '20px',
     padding: '28px 24px',
     boxSizing: 'border-box',
     boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
   };

   Master Container:
   style={{ width: '100%', maxWidth: '920px', margin: '0 auto', padding: '16px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '28px' }}

   A. HERO HEADER BANNER:
      - Container: style={cardStyle}
      - Subject badge ("${content.subject}") & Level pill ("${content.level}") with font-mono text.
      - Lesson title with font-size 2.2rem, font-weight 900, line-height 1.25, color C.text.
      - Collapsible or prominent Learning Objectives drawer with CheckCircle2 icons.

   B. CENTERPIECE INTERACTIVE SIMULATION LAB:
      - Container: style={cardStyle} (Single card container — DO NOT double-wrap or nest inside an extra card!).
      - Header with "Interactive Simulation Lab", live status pill ("Active Model", "Interactive Simulation"), and preset buttons.
      - Dynamic SVG visualizer with viewBox="0 0 860 340", width: '100%', height: 'auto', glowing paths, and coordinate axes.
      - Parameter control dock with responsive grid (minmax 220px, 1fr) for sliders and live value displays.
      - Telemetry readout pills displaying dynamic metrics derived from slider states.

   C. COMPREHENSIVE CURRICULUM MODULES (SECTIONS 1 THROUGH 6):
      - EVERY SECTION MUST BE A DEDICATED CARD USING style={cardStyle}!
      - Numbered badge ("01", "02", "03", etc.).
      - Section title and overview paragraphs.
      - Structured subsections (e.g. 1.1, 1.2) with distinct subheadings and deep multi-paragraph explanations.
      - Key Takeaways bulleted list with CheckCircle2 icons.
      - Misconception Alert card with 1px amber border, light amber background, and AlertTriangle icon.
      - Real-World Case Study / Analogy card with 4px cobalt left-border and Lightbulb icon.
      - Monospace mathematical formulations or code snippet blocks with dark slate background.

   ${content.worked_example ? `
   D. WORKED EXAMPLE:
      - Container: style={cardStyle}
      - Title, challenge problem scenario, and step-by-step breakdown boxes with numbered badges.
      - Core insight callout with Target icon.
   ` : ""}

   E. PRACTICE QUESTIONS & SOLUTIONS:
      - Container: style={cardStyle}
      - Question counter badge, progress bar, 4 tactile option cards with circular "A", "B", "C", "D" badges.
      - Instant feedback (Emerald for correct, Amber for incorrect distractor).
      - Full explanatory feedback reveal box explaining WHY the answer is correct and untangling the distractor.

3. STRICT REACT RULES OF HOOKS:
   - ALL useState, useEffect, useMemo hooks MUST be declared unconditionally at the very top of LessonComponent!
   - NEVER call hooks inside conditions, loops, or child helper renders.

OUTPUT: Return ONLY raw code starting with function LessonComponent() { ... } and ending with render(<LessonComponent />);. No markdown fences.`;

  const result = await model.generateContent(prompt);
  let code = result.response.text().trim();

  // Strip code fences
  code = code.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
  // Strip import/export
  code = code.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();

  if (!code.includes("render(")) {
    code = code + "\nrender(<LessonComponent />);";
  }

  return code;
}
