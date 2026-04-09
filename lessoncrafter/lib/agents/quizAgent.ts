import Groq from "groq-sdk";
import { LessonContent } from "./contentAgent";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

  const prompt = `You are the Quiz Designer Agent. Create a rigorous quiz STRICTLY based on the provided lesson content.

LESSON: "${content.title}"
KEY CONTENT:
${contentSummary}

Rules:
- Every question MUST be directly answerable from the content above. No outside knowledge.
- Create 5 questions: 2 easy, 2 medium, 1 hard
- Each question must have exactly 4 options
- correct_index is 0-based (0, 1, 2, or 3)
- Explanations must reference the lesson content directly

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

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a strict quiz designer. Return ONLY valid JSON with no markdown, no explanation, just the JSON object.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  });

  const rawText = completion.choices[0]?.message?.content?.trim() || "{}";

  try {
    const parsed = JSON.parse(rawText);
    return parsed as QuizOutput;
  } catch (e) {
    console.error("Quiz Agent parse error:", e);
    return { questions: [] };
  }
}
