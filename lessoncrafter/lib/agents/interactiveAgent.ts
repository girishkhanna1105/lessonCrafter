import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";
import { safeJsonParse } from "./safeJson";
import { PedagogyBrief } from "./pedagogyAgent";

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
  content: LessonContent,
  pedagogyBrief?: PedagogyBrief
): Promise<InteractiveOutput> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const sectionsOverview = content.sections
    .map((s, i) => `Section ${i + 1}: "${s.title}" — Key: ${s.key_points.slice(0, 2).join(", ")}`)
    .join("\n");

  const simTarget = pedagogyBrief?.simulationGoal
    ? `SPECIFIC SIMULATION GOAL: "${pedagogyBrief.simulationGoal}"`
    : "";

  const prompt = `You are the Interactive Simulation Engineer Agent.
Your job is to create self-contained interactive React/JSX parameter labs for a lesson.

LESSON TITLE: "${content.title}"
${simTarget}
SECTIONS:
${sectionsOverview}

For the lesson, create an interactive simulation module. The element MUST be:
- A valid, self-contained React functional component snippet (just JSX, no imports, no export)
- Using only React hooks (useState, useEffect) — NO external libraries
- Styled inline with React style={{ ... }} objects (use clean inline styles)
- Visually engaging palette: cobalt (#2563eb), marine cyan (#06b6d4), emerald (#10b981), amber (#f59e0b). NEVER use purple or violet.
- Supports dark and light backgrounds cleanly.
- Includes interactive controls (range slider with value display, toggle button, dynamic visual SVG or canvas representation).

Return ONLY valid JSON:
{
  "elements": [
    {
      "type": "visualization",
      "section_title": "${content.sections[0]?.title || "Simulation Lab"}",
      "description": "Interactive laboratory with parameter controls and live state readout",
      "jsx_code": "() => { const [param, setParam] = useState(50); return (<div style={{padding: 16}}>...</div>); }"
    }
  ]
}

Return ONLY valid JSON.`;

  const fallback: InteractiveOutput = {
    elements: [
      {
        type: "visualization",
        section_title: content.sections[0]?.title || "Interactive Lab",
        description: `Dynamic parameter sandbox for ${content.title}`,
        jsx_code: `() => {
          const [val, setVal] = useState(50);
          return (
            <div style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700 }}>Intensity Parameter: {val}%</div>
              <input type="range" min="0" max="100" value={val} onChange={(e) => setVal(Number(e.target.value))} style={{ width: '80%' }} />
              <div style={{ marginTop: 16, height: 8, background: '#2563eb', width: val + '%', borderRadius: 4, transition: 'all 0.2s' }}></div>
            </div>
          );
        }`,
      },
    ],
  };

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    return safeJsonParse<InteractiveOutput>(rawText, fallback);
  } catch (e: any) {
    console.error("[InteractiveAgent] Gemini error, using fallback:", e.message);
    return fallback;
  }
}
