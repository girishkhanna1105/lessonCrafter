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
  category: "conceptual_focus" | "diagnostic_hurdle" | "experiment_preference" | "baseline" | "goal";
  selectionType: "single" | "multiple";
  options: DiagnosticOption[];
}

export interface IntakeOutput {
  questions: DiagnosticQuestion[];
}

export async function runIntakeAgent(
  topic: string,
  level: string = "college"
): Promise<IntakeOutput> {
  if (!topic || topic.trim().length < 3) {
    return {
      questions: [
        {
          id: "focus_area",
          category: "conceptual_focus",
          selectionType: "multiple",
          question: `Which core dimensions of "${topic || "the topic"}" should we cover? (Select all that apply)`,
          options: [
            { id: "opt_foundations", label: "Foundations & First Principles", sublabel: "Intuitive mechanics, physical analogies, and core definitions" },
            { id: "opt_math", label: "Mathematical & Algorithmic Rigor", sublabel: "State equations, formal derivations, and quantitative constraints" },
            { id: "opt_applied", label: "Real-World Engineering & Applied Cases", sublabel: "System architecture, trade-offs, and practical failure modes" },
          ],
        },
        {
          id: "hurdle_area",
          category: "diagnostic_hurdle",
          selectionType: "single",
          question: "What is your primary conceptual friction point?",
          options: [
            { id: "opt_intuition", label: "Connecting Math to Mental Models", sublabel: "Understanding WHY the formulas work physically" },
            { id: "opt_traps", label: "Subtle Edge Cases & Common Misconceptions", sublabel: "Untangling counterintuitive traps and boundary conditions" },
            { id: "opt_execution", label: "Practical Implementation & Problem-Solving", sublabel: "Translating concepts into step-by-step solutions" },
          ],
        },
      ],
    };
  }

  const prompt = `You are the Lead Pedagogical Intake Profiler AI.
A learner is embarking on an in-depth lesson on: "${topic}" (Target Level: ${level}).

Generate 2 to 3 HYPER-SPECIFIC, TOPIC-TAILORED diagnostic questions that deconstruct this exact subject.
CRITICAL DUAL-MODE SELECTION RULE:
- Each question MUST have a "selectionType" field set to EITHER "single" OR "multiple".
- Use "multiple" for questions where the student can pick multiple sub-topics, mechanisms, or misconceptions to include.
- Use "single" for focal decisions like primary interactive model or primary target depth.

CRITICAL CONTENT RULES:
- DO NOT generate generic questions like "What is your skill level?".
- Every question MUST name specific concepts, mechanisms, equations, theories, or paradoxes of "${topic}".
- Question 1 (selectionType: "multiple", category: "conceptual_focus"): Ask which specific sub-topics, mechanisms, or equations of "${topic}" they want included in their curriculum (Select all that apply).
- Question 2 (selectionType: "single", category: "diagnostic_hurdle"): Ask which counterintuitive phenomenon or mathematical hurdle in "${topic}" is their biggest obstacle.
- Question 3 (selectionType: "single", category: "experiment_preference", optional): Ask what type of interactive parameter simulator would best anchor their understanding.
- Provide 3 or 4 clear, compelling option choices per question with a concise 1-sentence sublabel explaining the nuance.

Format strictly as JSON:
{
  "questions": [
    {
      "id": "q_focus",
      "category": "conceptual_focus",
      "selectionType": "multiple",
      "question": "Which specific mechanisms of ${topic} do you want covered? (Select all that apply)",
      "options": [
        { "id": "opt_1", "label": "Specific mechanism A", "sublabel": "Brief context on what this covers" },
        { "id": "opt_2", "label": "Specific mechanism B", "sublabel": "Brief context on what this covers" },
        { "id": "opt_3", "label": "Specific mechanism C", "sublabel": "Brief context on what this covers" }
      ]
    },
    {
      "id": "q_hurdle",
      "category": "diagnostic_hurdle",
      "selectionType": "single",
      "question": "Which specific hurdle or trap in ${topic} is your main obstacle?",
      "options": [
        { "id": "opt_1", "label": "Common friction point A", "sublabel": "Why learners stumble here" },
        { "id": "opt_2", "label": "Common friction point B", "sublabel": "Why learners stumble here" },
        { "id": "opt_3", "label": "Common friction point C", "sublabel": "Why learners stumble here" }
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

  return {
    questions: [
      {
        id: "q_focus",
        category: "conceptual_focus",
        selectionType: "multiple",
        question: `Which fundamental aspects of ${topic} do you want in your curriculum? (Select all that apply)`,
        options: [
          { id: "opt_mechanics", label: "Core Principles & Governing Laws", sublabel: "Deconstruct foundational mechanics and intuitive dynamics" },
          { id: "opt_math", label: "Formal Mathematics & Derivations", sublabel: "Step-by-step quantitative formulations and boundary values" },
          { id: "opt_applications", label: "Real-World Engineering & Applied Cases", sublabel: "Practical systems, trade-offs, and critical failure modes" },
        ],
      },
      {
        id: "q_hurdle",
        category: "diagnostic_hurdle",
        selectionType: "single",
        question: `Where does your intuition on ${topic} usually encounter friction?`,
        options: [
          { id: "opt_intuition", label: "Visualizing Invisible State Transitions", sublabel: "Translating abstract notation into concrete physical models" },
          { id: "opt_traps", label: "Common Misconceptions & Edge Cases", sublabel: "Untangling non-linear behavior and common exam/interview traps" },
          { id: "opt_problems", label: "Solving Challenge Problems Independently", sublabel: "Knowing which equations and strategies to apply when" },
        ],
      },
    ],
  };
}

