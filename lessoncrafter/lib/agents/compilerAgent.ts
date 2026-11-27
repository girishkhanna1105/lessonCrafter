import { LessonContent } from "./contentAgent";
import { InteractiveOutput } from "./interactiveAgent";
import { QuizOutput } from "./quizAgent";
import { callResilientLlm } from "../llmClient";
import { transform } from "sucrase";

export async function runCompilerAgent(
  content: LessonContent,
  interactive: InteractiveOutput,
  quiz: QuizOutput
): Promise<string> {
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
1. DUAL-MODE KINETIC PALETTE:
   At top of LessonComponent:
   const dark = typeof isDark !== 'undefined' ? isDark : true;
   const C = {
     bg: dark ? '#0a0f18' : '#f8fafc',
     card: dark ? 'rgba(12, 17, 28, 0.78)' : 'rgba(255, 255, 255, 0.82)',
     cardAlt: dark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(241, 245, 249, 0.7)',
     border: dark ? 'rgba(255,255,255,0.08)' : 'rgba(226,232,240,0.85)',
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

2. STRICT UNIFIED WIDTH & INSTRUMENT CARD ARCHITECTURE:
   CRITICAL CONSISTENT WIDTH & SPACING RULE:
   - The master outer container and EVERY SINGLE card in the lesson MUST share the EXACT SAME WIDTH: maxWidth 920px!
   - NO card is allowed to be wider or narrower than any other card. Every card must align perfectly to the exact same left and right edges.
   - Punctuation: NEVER use "//" in any user-facing badge, subtitle, or title. Always use ":" or "·" (e.g. "ENGINE: ACTIVE · 60 FPS VECTOR").
   
   Define unified instrument card style at the top of LessonComponent:
   const cardStyle = {
     width: '100%',
     maxWidth: '920px',
     margin: '0 auto',
     background: C.card,
     backdropFilter: 'blur(16px)',
     WebkitBackdropFilter: 'blur(16px)',
     border: '1px solid ' + C.border,
     borderRadius: '14px',
     padding: '20px 22px',
     boxSizing: 'border-box',
     boxShadow: dark ? '0 4px 20px -2px rgba(0,0,0,0.4)' : '0 4px 20px -2px rgba(0,0,0,0.05)'
   };

   Master Container:
   style={{ width: '100%', maxWidth: '920px', margin: '0 auto', padding: '12px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px' }}

   A. HERO HEADER BANNER:
      - Container: style={cardStyle}
      - Top Precision Status Strip: font-mono text-[10px], letter-spacing 0.05em, status dot (● ACTIVE), Subject badge ("${content.subject}") & Level pill ("${content.level}").
      - Lesson title with font-size 1.85rem sm:2.2rem, font-weight 900, line-height 1.25, color C.text.
      - Collapsible or prominent Learning Objectives drawer with CheckCircle2 icons and monospace numbered tags.

   B. CENTERPIECE INTERACTIVE SIMULATION LAB (VECTOR SCOPE):
      - Container: style={cardStyle} (Single card container — DO NOT double-wrap or nest inside an extra card!).
      - Header bar with "INTERACTIVE SIMULATION LAB : 60 FPS VECTOR", live indicator dot, and 1-click hypothesis scenario presets.
      - Dynamic SVG visualizer with viewBox="0 0 860 340", width: '100%', height: 'auto', subtle coordinate blueprint grid pattern, glowing laser vector paths, and auto-centering reticle coordinate readouts.
      - Parameter control dock with responsive grid for tactile sliders with monospace value chips and physical units.
      - Telemetry readout pills displaying dynamic metrics derived from slider states.

   C. COMPREHENSIVE CURRICULUM MODULES (SECTIONS 1 THROUGH 3):
      - EVERY SECTION MUST BE A DEDICATED CARD USING style={cardStyle}!
      - Monospace numbered stage badge ("01 · Parametric Modeling", "02 · Analytical Derivation", etc.).
      - Section title and overview paragraphs.
      - Structured subsections with distinct subheadings and deep multi-paragraph explanations.
      - Key Takeaways bulleted list with CheckCircle2 icons.
      - Socratic Misconception Alert card with 1px amber border, subtle amber glow, and AlertTriangle icon.
      - Real-World Case Study / Physical Analogy card with 3px cobalt left-border and Lightbulb icon.
      - Monospace mathematical formulations or code snippet blocks with dark background (#080c14).

   ${content.worked_example ? `
   D. WORKED EXAMPLE (COGNITIVE DAG PROGRESSION):
      - Container: style={cardStyle}
      - Title, challenge problem scenario, and step-by-step breakdown boxes with numbered badges.
      - Core insight callout with Target icon.
   ` : ""}

   E. PRACTICE QUESTIONS & SOKRATIC SOLUTIONS:
      - Container: style={cardStyle}
      - Question counter badge, progress bar, 4 tactile option cards with circular "A", "B", "C", "D" badges.
      - Instant feedback (Emerald for correct, Amber for incorrect distractor).
      - Full explanatory feedback reveal box explaining WHY the answer is correct and untangling the distractor.

3. STRICT REACT RULES OF HOOKS & CLOSING SYNTAX:
   - ALL useState, useEffect, useMemo hooks MUST be declared unconditionally at the very top of LessonComponent!
   - NEVER call hooks inside conditions, loops, or child helper renders.
   - You MUST ensure all opened tags (<div ...>) are properly closed (</div>).
   - The very last line MUST be: render(<LessonComponent />);

OUTPUT: Return ONLY raw code starting with function LessonComponent() { ... } and ending with render(<LessonComponent />);. No markdown fences.`;

  let code = await callResilientLlm({
    prompt,
    systemPrompt: "You are the Lead Educational Compiler Agent. Output raw executable React code with NO markdown code fences. End with render(<LessonComponent />);",
    maxTokens: 8192,
    temperature: 0.25,
  });

  // Strip code fences
  code = code.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
  // Strip import/export
  code = code.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();

  // Normalize ReactDOM.render or createRoot calls to react-live render
  code = code.replace(/ReactDOM\.render\s*\([^;]+?\);?/gi, "render(<LessonComponent />);");
  code = code.replace(/ReactDOM\.createRoot\([^)]+?\)\.render\([^)]+?\);?/gi, "render(<LessonComponent />);");
  code = code.replace(/```\s*$/g, "").trim();

  if (!code.includes("render(")) {
    code = code + "\nrender(<LessonComponent />);";
  }

  // Pre-flight AST validation with sucrase
  try {
    transform(code, { transforms: ["jsx"] });
  } catch (parseErr: any) {
    console.warn("[CompilerAgent] Pre-flight AST check detected issue, applying instant repair pass:", parseErr.message);
    try {
      const repairPrompt = `Fix the syntax error in this React code component so it compiles cleanly.
ERROR: ${parseErr.message}

CODE:
${code}

Return ONLY raw repaired code starting with function LessonComponent() and ending with render(<LessonComponent />);. No markdown.`;

      const repaired = await callResilientLlm({
        prompt: repairPrompt,
        systemPrompt: "You are a specialized code repair agent. Return ONLY raw valid React code with no markdown fences.",
        maxTokens: 8192,
        temperature: 0.1,
      });

      let cleanedRepair = repaired.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
      cleanedRepair = cleanedRepair.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();
      if (!cleanedRepair.includes("render(")) {
        cleanedRepair = cleanedRepair + "\nrender(<LessonComponent />);";
      }

      // Verify repaired code
      transform(cleanedRepair, { transforms: ["jsx"] });
      code = cleanedRepair;
      console.log("[CompilerAgent] Pre-flight repair succeeded.");
    } catch (repairErr: any) {
      console.error("[CompilerAgent] Pre-flight repair could not fully resolve AST:", repairErr.message);
    }
  }

  return code;
}
