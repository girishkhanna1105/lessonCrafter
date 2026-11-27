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
1. Preserve and refine the dual-mode C palette (dark ? ... : ...). Ensure all text, card backgrounds, and borders use dynamic colors from C, not hardcoded black or white.
2. STRICTLY NO TABS: Do NOT add activeTab or hide/show views. Keep the full 2-column workstation visible (Left: Curriculum, Right: Simulation Lab & Formative Quiz).
3. STRICT REACT RULES OF HOOKS: Keep all useState and useEffect calls at the very top of LessonComponent. Never move hooks into conditionals or arrays.
4. Header Alignment: Ensure lesson title has its own full-width row with line-height 1.3 so it never collides with or squeezes metadata badges.
5. Quiz Polish: Ensure exactly ONE single instance of the Quiz renders. Add question progress bar, circular option letter badges (A, B, C, D), and Emerald/Red feedback badges.
6. Kinetic Card Polish: Use subtle hairline borders (1px solid rgba(255,255,255,0.08) in dark, rgba(226,232,240,0.85) in light), precision border radius (12px to 14px), frosted translucent card backgrounds (rgba(12,17,28,0.78) in dark, rgba(255,255,255,0.82) in light with backdrop-filter: blur(16px)), and compact internal padding (18px to 22px).
7. Ensure technical code blocks use monospace font with dark background blocks (#080c14).
8. Strictly NO purple or violet colors.
9. ZERO "//": Never allow "//" in any user-facing label, badge, or title. Replace with ":" or "·".

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
