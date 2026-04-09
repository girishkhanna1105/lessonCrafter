import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ContentSection {
  title: string;
  explanation: string;
  key_points: string[];
  real_world_example: string;
  code_snippet?: string;
}

export interface LessonContent {
  title: string;
  subject: string;
  level: string;
  learning_objectives: string[];
  prerequisites: string[];
  introduction: string;
  sections: ContentSection[];
  summary: string;
}

export async function runContentAgent(
  topic: string,
  userProfile: any
): Promise<LessonContent> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const roleContext = userProfile?.role === "teacher"
    ? `This is for a TEACHER to use in a classroom. Create comprehensive, curriculum-aligned content with teaching notes.
       Institution: ${userProfile?.institution_name || "Unknown"}
       Teaching style: ${userProfile?.teaching_style || "lecture"}
       Level: ${userProfile?.grade_levels?.[0] || "General"}`
    : `This is for a STUDENT learning independently.
       Grade/Year: ${userProfile?.grade_or_year || "Unknown"}
       Institution Type: ${userProfile?.institution_type || "college"}
       Subject Focus: ${userProfile?.subject_focus?.[0] || "General"}
       Learning Goal: ${userProfile?.learning_goal || "deep_understanding"}`;

  const prompt = `You are the Content Architect Agent. Your job is to create structured, rich educational content.

USER CONTEXT:
${roleContext}

TOPIC: "${topic}"

Generate a comprehensive lesson content structure. Return ONLY valid JSON, no markdown, no code blocks.

The JSON must follow this exact schema:
{
  "title": "Clear lesson title",
  "subject": "Subject area",
  "level": "Beginner/Intermediate/Advanced",
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "introduction": "A compelling 2-3 paragraph introduction that hooks the learner",
  "sections": [
    {
      "title": "Section title",
      "explanation": "Detailed explanation (4-6 paragraphs)",
      "key_points": ["point 1", "point 2", "point 3"],
      "real_world_example": "A concrete real-world application",
      "code_snippet": "Optional: relevant code example if applicable"
    }
  ],
  "summary": "A concise summary of what was learned"
}

Generate 3-5 sections. Make the content rich, accurate, and engaging.`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  // Strip markdown code fences if present
  const jsonText = rawText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(jsonText) as LessonContent;
  } catch (e) {
    console.error("Content Agent parse error:", e);
    throw new Error("Content Agent failed to return valid JSON");
  }
}
