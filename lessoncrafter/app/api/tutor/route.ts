import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { lessonTitle, lessonOutline, userQuery, history = [] } = await req.json();

    if (!userQuery || !userQuery.trim()) {
      return NextResponse.json(
        { success: false, error: "userQuery is required." },
        { status: 400 }
      );
    }

    const systemPrompt = `You are the LessonCrafter Socratic AI Tutor — a patient, perceptive, and intellectually engaging educational mentor embedded directly inside an interactive lesson.

ACTIVE LESSON: "${lessonTitle || "Interactive Study Session"}"
LESSON TOPIC: "${lessonOutline || "Core Fundamentals"}"

SOCRATIC PEDAGOGY PRINCIPLES:
1. Guide Rather Than Tell: Do not immediately dump final solutions or quiz answers. Ask probing, thoughtful questions that empower the student to deduce the answer themselves.
2. Conceptual Grounding: Connect abstract concepts to intuitive physical analogies or practical examples from the lesson.
3. Scaffold Learning: Break complex queries down into smaller, digestible steps.
4. Encourage Experimentation: If relevant, suggest how the student can tweak inputs in the interactive module on their screen to see what happens.
5. Conciseness & Formatting: Keep your responses concise (2-3 concise paragraphs maximum), clear, and formatted in clean GitHub-flavored markdown with bolding for key terms.
6. Tone: Warm, intellectually curious, encouraging, and razor-sharp. Strictly avoid violet or purple aesthetic references.`;

    const groqMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.slice(-6).map((m: Message) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userQuery.trim() },
    ];

    // Priority 1: High-reasoning Groq models
    const candidateModels = [
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "openai/gpt-oss-20b",
    ];

    for (const modelId of candidateModels) {
      try {
        const response = await groq.chat.completions.create({
          model: modelId,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 600,
        });

        const reply = response.choices[0]?.message?.content;
        if (reply && reply.trim()) {
          return NextResponse.json({
            success: true,
            answer: reply.trim(),
            modelUsed: modelId,
          });
        }
      } catch (err: any) {
        console.warn(`[Tutor] Groq model ${modelId} failed: ${err.message}. Trying next fallback...`);
      }
    }

    // Fallback: Gemini
    if (genAI) {
      try {
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chatHistoryPrompt = history
          .slice(-4)
          .map((m: Message) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
          .join("\n");

        const fullPrompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${chatHistoryPrompt}\n\nStudent: ${userQuery}\nTutor:`;
        const result = await geminiModel.generateContent(fullPrompt);
        const reply = result.response.text();

        if (reply && reply.trim()) {
          return NextResponse.json({
            success: true,
            answer: reply.trim(),
            modelUsed: "gemini-1.5-flash",
          });
        }
      } catch (geminiErr: any) {
        console.error(`[Tutor] Gemini fallback failed: ${geminiErr.message}`);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "All AI tutor providers encountered temporary capacity limits. Please try again in a moment.",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("[Tutor Route Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
