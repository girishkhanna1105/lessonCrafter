import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callResilientLlm } from "@/lib/llmClient";

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

    const prompt = `You are a specialized React code repair agent. Fix the following react-live component that has a runtime or syntax error.

CRITICAL FORMAT RULES (react-live noInline mode):
1. NO import statements
2. NO export statements
3. Component MUST be named "LessonComponent" as: function LessonComponent() { ... }
4. LAST LINE must be: render(<LessonComponent />)
5. Only inline styles with style={{ ... }} — no Tailwind/CSS classes
6. Ensure all opened JSX tags are properly closed with matching closing tags!

LESSON TOPIC: "${outline}"

ERROR TO FIX: ${errorMessage}

REPAIR DIRECTIVES:
- Ensure all brackets, braces, and tags are 100% balanced and syntactically valid.
- If hooks were declared conditionally or inside loops, move ALL useState/useEffect hooks to the top of LessonComponent.
- Complete any truncated JSX blocks cleanly.

BROKEN CODE:
${originalCode}

Return ONLY the fixed code. No markdown code fences. Start with function LessonComponent() and end with render(<LessonComponent />);`;

    let repairedCode = await callResilientLlm({
      prompt,
      systemPrompt: "You are a master React compiler and code repair specialist. Return ONLY raw valid React code with NO markdown fences.",
      maxTokens: 8192,
      temperature: 0.1,
    });

    // Strip code fences
    repairedCode = repairedCode.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
    // Strip imports/exports
    repairedCode = repairedCode.replace(/^import\s+.*$/gm, "").replace(/^export\s+default\s+/gm, "").replace(/^export\s+/gm, "").trim();
    // Ensure render() exists
    if (!repairedCode.includes("render(")) {
      repairedCode = repairedCode + "\nrender(<LessonComponent />);";
    }

    // Save to DB (skip for local-only fallback lessons)
    if (typeof lessonId === "string" && !lessonId.startsWith("local-")) {
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
    }

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