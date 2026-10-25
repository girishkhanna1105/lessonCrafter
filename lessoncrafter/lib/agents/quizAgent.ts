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

  // Preferred model: openai/gpt-oss-120b on Groq for deep reasoning and distractor accuracy
  const candidateModels = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
  ];

  let rawText = "{}";

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

      rawText = completion.choices[0]?.message?.content?.trim() || "{}";
      break; // Successfully got completion
    } catch (err: any) {
      console.warn(`[QuizAgent] Model ${modelId} failed: ${err.message}. Trying next candidate...`);
    }
  }

  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    return parsed as QuizOutput;
  } catch (e) {
    console.error("[QuizAgent] Parse error:", e);
    return { questions: [] };
  }
}
