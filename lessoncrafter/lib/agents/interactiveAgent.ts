import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface InteractiveElement {
  type: "code_demo" | "visualization" | "diagram" | "animation";
  section_title: string;
  description: string;
  jsx_code: string; // Self-contained JSX/React code for the element
}

export interface InteractiveOutput {
  elements: InteractiveElement[];
}

export async function runInteractiveAgent(
  content: LessonContent
): Promise<InteractiveOutput> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const sectionsOverview = content.sections
    .map((s, i) => `Section ${i + 1}: "${s.title}" — Key: ${s.key_points.slice(0, 2).join(", ")}`)
    .join("\n");

  const prompt = `You are the Interactive Builder Agent. Your job is to create self-contained interactive React/JSX elements for a lesson.

LESSON TITLE: "${content.title}"
SECTIONS:
${sectionsOverview}

For each section, create ONE interactive element. Each element MUST be:
- A valid, self-contained React functional component snippet (just JSX, no imports, no export)
- Using only React hooks (useState, useEffect) — NO external libraries
- Styled inline with Tailwind-like utility classes using className
- Visually engaging (use color, animation, interactivity)

Return ONLY valid JSON, no markdown, no code blocks:
{
  "elements": [
    {
      "type": "code_demo" | "visualization" | "diagram" | "animation",
      "section_title": "Matching section title",
      "description": "What this element demonstrates",
      "jsx_code": "() => { const [state, setState] = useState(0); return (<div>...</div>); }"
    }
  ]
}

Generate exactly ${content.sections.length} elements, one per section. Keep jsx_code concise and functional.`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(jsonText) as InteractiveOutput;
  } catch (e) {
    console.error("Interactive Agent parse error:", e);
    // Return empty if parse fails — compiler will handle gracefully
    return { elements: [] };
  }
}
