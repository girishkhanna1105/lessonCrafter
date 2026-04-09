import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { lessonId, outline, originalCode, errorMessage } = await req.json();

  if (!lessonId || !outline || !originalCode || !errorMessage) {
    return NextResponse.json(
      { success: false, error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    console.log(`🔧 [Repair] Fixing runtime error for Lesson ${lessonId}: ${errorMessage}`);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a React code repair agent. Fix the following react-live component that has a runtime error.

CRITICAL FORMAT RULES (react-live noInline mode):
1. NO import statements
2. NO export statements
3. Component MUST be named "LessonComponent" as: function LessonComponent() { ... }
4. LAST LINE must be: render(<LessonComponent />)
5. Only inline styles — no Tailwind/CSS classes

LESSON TOPIC: "${outline}"

ERROR TO FIX: ${errorMessage}

BROKEN CODE:
${originalCode}

Return ONLY the fixed code. No markdown. No backticks. Start with the first code line and end with render(<LessonComponent />)`;

    const result = await model.generateContent(prompt);
    let repairedCode = result.response.text().trim();

    // Strip code fences
    repairedCode = repairedCode.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
    // Strip imports/exports
    repairedCode = repairedCode.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();
    // Ensure render() exists
    if (!repairedCode.includes("render(")) {
      repairedCode = repairedCode + "\nrender(<LessonComponent />);";
    }

    // Save to DB
    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        ts_code: repairedCode,
        status: "generated",
        compile_status: "success",
        compile_error: null,
      })
      .eq("id", lessonId);

    if (updateError) throw new Error("Supabase update failed: " + updateError.message);

    console.log(`✅ [Repair] Lesson ${lessonId} repaired and saved.`);
    return NextResponse.json({ success: true, repairedCode });

  } catch (err: any) {
    console.error(`❌ [Repair] Failed for ${lessonId}:`, err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}