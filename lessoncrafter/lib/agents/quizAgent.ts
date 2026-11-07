import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";
import { safeJsonParse } from "./safeJson";
import { PedagogyBrief } from "./pedagogyAgent";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  misconception_tested?: string;
}

export interface QuizOutput {
  questions: QuizQuestion[];
}

export async function runQuizAgent(
  content: LessonContent,
  pedagogyBrief?: PedagogyBrief
): Promise<QuizOutput> {
  const contentSummary = content.sections
    .map((s) => `${s.title}: ${s.key_points.join(". ")}`)
    .join("\n");

  const distractorsPrompt = pedagogyBrief?.recommendedDistractors?.length
    ? `CALIBRATED MISCONCEPTION DISTRACTORS TO TEST:
${pedagogyBrief.recommendedDistractors.map((d, i) => `  - Misconception pattern ${i + 1}: "${d}"`).join("\n")}`
    : "";

  const prompt = `You are the Formative Assessment Evaluator Agent.
Create a rigorous, formative diagnostic quiz STRICTLY based on the provided lesson content.

LESSON: "${content.title}"
KEY CONTENT:
${contentSummary}

${distractorsPrompt}

Rules:
- Every question MUST be directly answerable from the content.
- Create 5 questions: 2 easy, 2 medium, 1 hard.
- Each question must have exactly 4 plausible options (1 correct, 3 carefully calibrated distractors targeting real conceptual misconceptions, NOT obvious joke answers).
- correct_index is 0-based (0, 1, 2, or 3).
- Explanations must clearly explain WHY the correct option is right AND why the primary distractor is a trap.

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "Why this is correct and which misconception the wrong options represent.",
      "difficulty": "easy"
    }
  ]
}`;

  const fallbackQuiz: QuizOutput = {
    questions: [
      {
        question: `What is the primary governing principle of ${content.title}?`,
        options: [
          content.sections[0]?.key_points[0] || "Foundational system relationship",
          "It operates without any boundary conditions",
          "All parameter variations produce identical outcomes",
          "It violates universal conservation laws"
        ],
        correct_index: 0,
        explanation: `As detailed in the lesson, the core mechanics rely on ${content.sections[0]?.key_points[0] || "fundamental system relationships"}.`,
        difficulty: "easy"
      },
      {
        question: `When analyzing system transitions, what occurs at the critical threshold?`,
        options: [
          "The system transitions to an adapted state governed by stability constraints",
          "The system ceases all energy exchange permanently",
          "Variables decouple and behave randomly",
          "The initial parameters are duplicated instantaneously"
        ],
        correct_index: 0,
        explanation: `Under varying parameters, the system dynamically adapts to maintain equilibrium within stability constraints.`,
        difficulty: "medium"
      }
    ]
  };

  // 1. Try Groq fast inference first
  if (groq) {
    const candidateModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ];

    for (const modelId of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are a strict, pedagogical quiz designer. Return ONLY valid JSON matching the requested schema with no markdown code fences.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        });

        const rawText = completion.choices[0]?.message?.content || "";
        const parsed = safeJsonParse<QuizOutput>(rawText, { questions: [] });
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[QuizAgent] Groq model ${modelId} failed: ${err.message}.`);
      }
    }
  }

  // 2. Gemini fallback
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const parsed = safeJsonParse<QuizOutput>(text, fallbackQuiz);
      if (parsed.questions?.length) {
        return parsed;
      }
    } catch (geminiErr: any) {
      console.error("[QuizAgent] Gemini fallback failed:", geminiErr);
    }
  }

  return fallbackQuiz;
}
