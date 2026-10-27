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
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `You are the Lead Educational Compiler Agent. Write a single, self-contained, instrument-grade React component that renders an extraordinary, interactive lesson using react-live.

CRITICAL FORMAT RULES — MUST FOLLOW EXACTLY:
1. NO import statements at all (React, useState, useEffect, Lucide icons, etc. are already in scope)
2. NO export statements (no "export default", no "export function")
3. Must define exactly ONE main component called "LessonComponent" as: function LessonComponent() { ... }
4. The LAST LINE of the code MUST be: render(<LessonComponent />)
5. Use only inline styles with the style={{ ... }} prop — NO Tailwind className, NO external CSS classes
6. Available in scope:
   - React hooks: useState, useEffect, useRef, useMemo, useCallback
   - Dual-mode theme flag: isDark (boolean, true for dark mode, false for light mode)
   - Scope icons (render as <Sparkles style={{width:16,height:16}} />): Sparkles, Check, X, RotateCcw, ArrowRight, Play, Pause, BookOpen, Layers, Award, Sliders, Info, Lightbulb, Zap, CheckCircle2, AlertCircle

LESSON DATA:
Title: "${content.title}"
Subject: "${content.subject}" | Level: "${content.level}"
Objectives: ${content.learning_objectives.join("; ")}
Introduction: "${content.introduction}"

SECTIONS:
${content.sections.map((s, i) => `
[Section ${i + 1}]: "${s.title}"
Explanation: ${s.explanation}
Key Points: ${s.key_points.join(" | ")}
Real-World Example: ${s.real_world_example}
`).join("\n")}

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

DESIGN & ARCHITECTURE DIRECTIVES (Pantone Cobalt Architect Dual-Mode):
1. DUAL-MODE PALETTE:
   At top of LessonComponent, compute:
   \`\`\`js
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
   \`\`\`
   ALL styles must use this C palette so changing dark/light mode immediately updates every element!

2. UNIFIED WORKSTATION LAYOUT (STRICTLY NO TABS! NEVER HIDE CONTENT OR HOOKS BEHIND TABS):
   Do NOT implement activeTab or tabs switching between Lesson, Interactive, and Quiz.
   Instead, build a unified, split-screen workstation where everything is visible:

   A. TOP HEADER HERO BANNER (Full width, clean alignment, ZERO collision):
      - Top metadata row: flex row with Subject badge ("${content.subject}"), Level pill ("${content.level}"), and Objectives drawer toggle button.
      - Title row: Full-width lesson title with generous font size (1.8rem-2.2rem), font-weight 800, line-height 1.3, color C.text. Gives title full space to wrap naturally without squishing or colliding!
      - Objectives banner/drawer: collapsible card displaying the learning objectives cleanly.

   B. TWO-COLUMN SPLIT WORKSTATION (flex-wrap container with gap 28px):
      - LEFT COLUMN (Theory & Curriculum, ~58% width, flex: '1 1 58%', minWidth: '340px'):
        - Introduction card: Compelling overview with C.card background, subtle border, and comfortable reading line-height.
        - Curriculum Section cards:
          - Each section in its own distinct card.
          - Numbered badge ("01", "02", "03") with C.cardAlt background and cobalt text.
          - Section title (1.4rem, font-weight 700).
          - Section explanation paragraphs (crisp typography, high contrast).
          - Key Takeaways bulleted list with CheckCircle2 icons.
          - Highlighted Real-World Analogy card with 4px cobalt left-border and Lightbulb icon.
          - Optional code snippets in monospace blocks (#080c14 background).

      - RIGHT COLUMN (Sticky Interactive Lab & Formative Quiz, ~40% width, flex: '1 1 38%', minWidth: '320px', position: 'sticky', top: '24px'):
        - CARD 1: THE INTERACTIVE SIMULATION LAB:
          - Self-contained, stateful interactive laboratory.
          - Realistic parameter controls (range sliders with live value display, action buttons, toggle switches).
          - Dynamic visual display (animated SVG, canvas, bar chart, or state diagrams responding in real time to slider values).
          - ALL HOOKS for this simulation MUST be declared at the top of LessonComponent!
        
        - CARD 2: THE FORMATIVE ASSESSMENT QUIZ (RENDERED ONCE, NEVER DUPLICATED):
          - Render exactly ONE single quiz card!
          - Header: Question counter badge (e.g. "Question {qIndex + 1} of {totalQuestions}"), score badge, and an animated horizontal progress bar (height: 4px, background: C.cobalt).
          - Question text: Clear, bold, readable.
          - 4 Option buttons: Clean cards with "A", "B", "C", "D" circular badges.
            - Default: C.cardAlt with C.border.
            - Selected: C.borderHover with cobalt tint.
            - After submit: Correct option turns Emerald (#10b981) with Check icon; Selected incorrect option turns Danger (#ef4444) with X icon.
          - "Submit Answer" button: Green (#10b981), disabled until an option is selected.
          - Explanation reveal box: Appears after submission with Lightbulb icon and thorough explanation.
          - "Next Question" button: advances to the next question.
          - Final completion view: Shows final score, trophy/award icon, and "Try Again" reset button.

3. STRICT REACT RULES OF HOOKS (CRITICAL):
   - Every single hook (useState, useEffect, useRef, useCallback, useMemo) MUST be called at the very top of LessonComponent, unconditionally!
   - NEVER call hooks inside conditional blocks (if / ternary).
   - NEVER call hooks inside array mappings, objects, or helper functions called in JSX.
   - Do NOT create objects with "code: () => { useState() }" and call them in JSX.

OUTPUT: Return ONLY the raw code. No markdown code fences. Start directly with the first line of code.`;

  const result = await model.generateContent(prompt);
  let code = result.response.text().trim();

  // Strip any markdown code fences if model wraps them
  code = code.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();

  // Strip any import/export statements the model might have added anyway
  code = code.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();

  // Ensure render() call exists at the end
  if (!code.includes("render(")) {
    code = code + "\nrender(<LessonComponent />);";
  }

  return code;
}
