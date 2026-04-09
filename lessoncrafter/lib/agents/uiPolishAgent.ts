import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runUIPolishAgent(rawCode: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `You are the UI Polish Agent. Improve the visual quality of this react-live component.

CRITICAL: This code runs inside react-live with noInline=true. You MUST preserve these rules:
1. NO import statements
2. NO export statements  
3. Component must be named "LessonComponent"
4. Last line MUST be: render(<LessonComponent />)
5. Only inline styles — no Tailwind/CSS classes

CURRENT COMPONENT:
${rawCode}

YOUR TASKS (improve visually only, keep all functionality):
1. Ensure dark theme background (#0a0a1a or #0f0f1a)
2. Add proper visual hierarchy: title bold and large, sections clearly separated with cards
3. Improve quiz section: clear correct/wrong feedback colors (green=#22c55e, red=#ef4444)
4. Add progress indicator and score display for quiz
5. Ensure code snippets use monospace font in dark blocks
6. Add hover states for interactive elements using onMouseEnter/onMouseLeave
7. Add a header with the lesson title, level badge, and objectives list

OUTPUT: Return ONLY the raw code. No markdown. No \`\`\`. Start with the first code line.`;

  const result = await model.generateContent(prompt);
  let polished = result.response.text().trim();

  // Strip code fences
  polished = polished.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
  // Strip any imports/exports the model sneaked in
  polished = polished.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();
  // Ensure render() is still there
  if (!polished.includes("render(")) {
    polished = polished + "\nrender(<LessonComponent />);";
  }

  return polished;
}
