import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonContent } from "./contentAgent";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface QuizOutput {
  questions: QuizQuestion[];
}

export async function runQuizAgent(
  content: LessonContent
): Promise<QuizOutput> {
  const contentSummary = content.sections
    .map((s) => `${s.title}: ${s.key_points.join(". ")}`)
    .join("\n");

  const prompt = `You are the Quiz Designer Agent. Create a rigorous, formative quiz STRICTLY based on the provided lesson content.

LESSON: "${content.title}"
KEY CONTENT:
${contentSummary}

Rules:
- Every question MUST be directly answerable from the content above. No outside knowledge.
- Create 5 questions: 2 easy, 2 medium, 1 hard.
- Each question must have exactly 4 plausible options (1 correct, 3 carefully calibrated distractors targeting common misconceptions).
- correct_index is 0-based (0, 1, 2, or 3).
- Explanations must clearly reference the concept and explain why the correct option is right.

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_index": 0,
      "explanation": "Why this is correct based on the lesson",
      "difficulty": "easy"
    }
  ]
}`;

  let parsed: QuizOutput | null = null;

  // 1. Try Groq fast inference first if available
  if (groq) {
    const candidateModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ];

    for (const modelId of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are a strict, pedagogical quiz designer. Return ONLY valid JSON matching the requested schema with no markdown code fences, no extra preamble.",
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

        const rawText = completion.choices[0]?.message?.content?.trim() || "{}";
        const cleaned = rawText
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        const candidate = JSON.parse(cleaned);
        if (candidate.questions && Array.isArray(candidate.questions) && candidate.questions.length > 0) {
          parsed = candidate;
          break;
        }
      } catch (err: any) {
        console.warn(`[QuizAgent] Groq model ${modelId} failed: ${err.message}.`);
      }
    }
  }

  // 2. Resilient Gemini Fallback if Groq failed or wasn't configured
  if (!parsed || !parsed.questions || parsed.questions.length === 0) {
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
        const cleaned = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (geminiErr: any) {
        console.error("[QuizAgent] Gemini fallback failed:", geminiErr);
      }
    }
  }

  return parsed && Array.isArray(parsed.questions) ? parsed : { questions: [] };
}
