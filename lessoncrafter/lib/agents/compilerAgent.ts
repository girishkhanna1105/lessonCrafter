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
Explanation: ${s.explanation}
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

2. UNIFIED WORKSTATION LAYOUT (STRICTLY NO TABS!):
   Split-screen workstation with gap 28px:

   A. TOP HEADER HERO BANNER:
      - Subject badge ("${content.subject}") & Level pill ("${content.level}").
      - Full-width lesson title with generous font size (1.8rem-2.2rem), font-weight 800, line-height 1.3, color C.text.
      - Collapsible Learning Objectives drawer card.

   B. LEFT COLUMN (Theory & Curriculum, ~58% width, minWidth: '340px'):
      - Introduction card: 2-3 deep paragraphs with comfortable line-height (1.7) and high-contrast text.
      - Section Cards:
        - DO NOT abbreviate! Render the comprehensive explanation paragraphs in full.
        - Numbered badge ("01", "02", "03").
        - Key Takeaways bulleted list with CheckCircle2 icons.
        - Misconception Alert card with 1px amber border, light amber background, and AlertTriangle icon.
        - Real-World Analogy card with 4px cobalt left-border and Lightbulb icon.
        - Monospace code/formula blocks if provided (#080c14 background).
      ${content.worked_example ? `
      - Worked Example Card:
        - Title, problem scenario, and 4 step-by-step breakdown boxes with numbered badges.
        - Core insight callout.
      ` : ""}

   C. RIGHT COLUMN (Sticky Interactive Lab & Formative Quiz, ~40% width, position: 'sticky', top: '24px'):
      - CARD 1: THE INTERACTIVE SIMULATION LAB:
        - Self-contained, stateful interactive parameter laboratory with dynamic SVG or canvas and live sliders.
        - ALL HOOKS for this simulation MUST be declared at the top of LessonComponent!
      - CARD 2: THE FORMATIVE ASSESSMENT QUIZ (RENDERED ONCE):
        - Header with Question counter badge, progress bar, 4 option cards with "A", "B", "C", "D" circular badges.
        - Green on correct, red on incorrect, with full explanation reveal box.

3. STRICT REACT RULES OF HOOKS:
   - ALL hooks unconditionally at the very top of LessonComponent!
   - NEVER call hooks in conditionals, loops, or nested functions.

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
