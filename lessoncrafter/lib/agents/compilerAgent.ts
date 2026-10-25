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

  const prompt = `You are the Compiler Agent. Write a single, self-contained code block that renders a beautiful lesson using react-live.

CRITICAL FORMAT RULES — MUST FOLLOW EXACTLY:
1. NO import statements at all (React, useState, useEffect, etc. are already in scope)
2. NO export statements (no "export default", no "export function")
3. Must define exactly ONE main component called "LessonComponent" as: function LessonComponent() { ... }
4. The LAST LINE of the code MUST be: render(<LessonComponent />)
5. Use only: useState, useEffect, useRef, useMemo (all in scope already)
6. Use only inline styles — NO Tailwind, NO CSS files, NO className with Tailwind utilities

LESSON DATA TO RENDER:
Title: ${content.title}
Subject: ${content.subject}
Level: ${content.level}
Learning Objectives: ${content.learning_objectives.join(", ")}
Introduction: ${content.introduction}

SECTIONS (${content.sections.length} sections):
${content.sections.map((s, i) => `
Section ${i + 1}: "${s.title}"
Explanation: ${s.explanation.slice(0, 400)}...
Key Points: ${s.key_points.join(", ")}
Real World Example: ${s.real_world_example}
`).join("\n")}

Summary: ${content.summary}

QUIZ (${quiz.questions.length} questions):
${quiz.questions.map((q, i) => `Q${i + 1}: ${q.question}
Options: ${q.options.join(" | ")}
Correct: ${q.options[q.correct_index]}
`).join("\n")}

DESIGN REQUIREMENTS (Pantone Cobalt Architect Theme):
- Background: Deep architectural slate #0a0f18 — strictly NO purple, NO violet, NO navy
- Cards/sections: #111827 or #161f30 with clean hairline border (rgba(255,255,255,0.08))
- Primary accent: #2563eb (Classic Cobalt) and #3b82f6 (Electric Cobalt) for buttons and active states
- Secondary accent: #06b6d4 (Marine Cyan) for telemetry, data readouts, and tags
- Formative indicator: #f59e0b (Solar Amber) for status chips
- Quiz: Emerald #10b981 for correct answers, Red #ef4444 for incorrect
- Text: #ffffff for headings, #cbd5e1 for body, #94a3b8 for secondary text
- Section dividers: 1px solid rgba(255,255,255,0.08)
- Font: Inter or system-ui via fontFamily style; JetBrains Mono for code blocks
- Layout: Generous padding, crisp micro-radii (8px-12px), high-contrast readability

OUTPUT: Return ONLY the raw code. No markdown. No code blocks. No \`\`\`. Start directly with the first line of code.

Example structure:
function LessonComponent() {
  const [score, setScore] = useState(0);
  return (
    <div style={{background:'#0a0a0a', minHeight:'100vh', padding:'40px 60px', fontFamily:'system-ui,sans-serif', color:'#fff'}}>
      ...all content...
    </div>
  );
}
render(<LessonComponent />)`;

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
