import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "./safeJson";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface DiagnosticOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface DiagnosticQuestion {
  id: string;
  question: string;
  category: "baseline" | "goal" | "preference";
  options: DiagnosticOption[];
}

export interface IntakeOutput {
  questions: DiagnosticQuestion[];
}

const DEFAULT_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "baseline",
    category: "baseline",
    question: "What is your current familiarity with this topic?",
    options: [
      { id: "beginner", label: "Complete Beginner", sublabel: "Start from absolute zero with intuitive mental models" },
      { id: "intermediate", label: "Know the Basics", sublabel: "Familiar with concepts, need deeper mechanics & intuition" },
      { id: "advanced", label: "Advanced / Rigorous", sublabel: "Focus on formal math, edge cases, and high-level derivations" },
    ],
  },
  {
    id: "goal",
    category: "goal",
    question: "What is your primary learning breakthrough goal?",
    options: [
      { id: "intuition", label: "Build Physical Intuition", sublabel: "Master how and why it works through concrete analogies" },
      { id: "simulation", label: "Interactive Experimentation", sublabel: "Manipulate live simulation sliders and observe behavior" },
      { id: "exam_prep", label: "Exams & Problem Solving", sublabel: "Focus on common traps, formulas, and assessment questions" },
    ],
  },
  {
    id: "preference",
    category: "preference",
    question: "What explanation style do you prefer?",
    options: [
      { id: "visual", label: "Visual & Analogy-First", sublabel: "Rich mental models, diagrams, and step-by-step intuition" },
      { id: "analytical", label: "Analytical & Systematic", sublabel: "Clean definitions, parameter tables, and structured mechanics" },
    ],
  },
];

export async function runIntakeAgent(
  topic: string,
  level: string = "college"
): Promise<IntakeOutput> {
  if (!topic || topic.trim().length < 3) {
    return { questions: DEFAULT_QUESTIONS };
  }

  const prompt = `You are the Adaptive Pedagogical Intake Agent.
A student wants to learn: "${topic}" (Target Level: ${level}).

Generate exactly 2 to 3 tailored diagnostic questions to understand their current background, sticking points, and learning goals for THIS SPECIFIC TOPIC.
Do not make generic questions; mention concepts or keywords related to "${topic}".

Format strictly as JSON:
{
  "questions": [
    {
      "id": "baseline",
      "category": "baseline",
      "question": "Topic-tailored baseline question?",
      "options": [
        { "id": "opt1", "label": "Option text", "sublabel": "Brief clarification" },
        { "id": "opt2", "label": "Option text", "sublabel": "Brief clarification" },
        { "id": "opt3", "label": "Option text", "sublabel": "Brief clarification" }
      ]
    },
    {
      "id": "goal",
      "category": "goal",
      "question": "Topic-tailored learning breakthrough question?",
      "options": [
        { "id": "goal1", "label": "Option text", "sublabel": "Brief clarification" },
        { "id": "goal2", "label": "Option text", "sublabel": "Brief clarification" }
      ]
    }
  ]
}

Return ONLY valid JSON.`;

  // 1. Try Groq fast inference first (<600ms)
  if (groq) {
    const candidateModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    for (const modelId of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are an expert pedagogical intake profiler. Output strictly valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.3,
          max_tokens: 800,
          response_format: { type: "json_object" },
        });

        const raw = completion.choices[0]?.message?.content || "";
        const parsed = safeJsonParse<IntakeOutput>(raw, { questions: [] });
        if (parsed.questions && parsed.questions.length >= 2) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[IntakeAgent] Groq ${modelId} failed:`, err.message);
      }
    }
  }

  // 2. Fallback to Gemini 2.5 Flash Lite
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });
      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const parsed = safeJsonParse<IntakeOutput>(raw, { questions: [] });
      if (parsed.questions && parsed.questions.length >= 2) {
        return parsed;
      }
    } catch (err: any) {
      console.warn("[IntakeAgent] Gemini fallback failed:", err.message);
    }
  }

  return { questions: DEFAULT_QUESTIONS };
}

