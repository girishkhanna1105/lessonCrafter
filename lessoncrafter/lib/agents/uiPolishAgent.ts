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
1. Ensure architectural slate background (#0a0f18) with Cobalt (#2563eb / #3b82f6) and Cyan (#06b6d4) accents — strictly NO purple or violet
2. Add proper visual hierarchy: title bold and large in Plus Jakarta Sans / Inter, sections clearly separated in cards (#111827)
3. Improve quiz section: clear correct/wrong feedback colors (Emerald=#10b981, Red=#ef4444)
4. Add progress indicator and score display for quiz with Solar Amber (#f59e0b) badges
5. Ensure code snippets use monospace font (JetBrains Mono) in dark technical blocks (#080c14)
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
