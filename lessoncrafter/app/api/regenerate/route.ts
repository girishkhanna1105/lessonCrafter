import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runContentAgent } from "@/lib/agents/contentAgent";
import { runCompilerAgent } from "@/lib/agents/compilerAgent";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { lessonId, outline } = await req.json();

  if (!lessonId || !outline) {
    return NextResponse.json(
      { success: false, error: "Missing lessonId or outline" },
      { status: 400 }
    );
  }

  try {
    console.log(`🔄 [Regenerate] Smart 3-agent pipeline for lesson ${lessonId}...`);

    await supabase
      .from("lessons")
      .update({ status: "generating", compile_error: null })
      .eq("id", lessonId);

    // ─── Agent 1: Re-generate content ─────────────────────────────────────
    console.log("🧠 [Regenerate] Agent 1: Content Architect running...");
    const content = await runContentAgent(outline, null);

    // ─── Agent 4: Compile directly ─────────────────────────────────────────
    console.log("⚙️ [Regenerate] Agent 4: Compiler running...");
    let finalCode = await runCompilerAgent(
      content,
      { elements: [] },
      { questions: [] }
    );
    if (!finalCode.includes("render(")) {
      finalCode = finalCode + "\nrender(<LessonComponent />);";
    }

    // Save to DB
    const { error } = await supabase
      .from("lessons")
      .update({
        title: content.title,
        ts_code: finalCode,
        status: "generated",
        compile_status: "success",
        compile_error: null,
      })
      .eq("id", lessonId);

    if (error) throw new Error("Supabase update failed: " + error.message);

    console.log(`✅ [Regenerate] Lesson ${lessonId} regenerated (3-agent fast path).`);
    return NextResponse.json({ success: true, generatedCode: finalCode });

  } catch (err: any) {
    console.error(`❌ [Regenerate] Failed for ${lessonId}:`, err.message);

    await supabase
      .from("lessons")
      .update({
        status: "error",
        compile_status: "failed",
        compile_error: `Regeneration failed: ${err.message}`,
      })
      .eq("id", lessonId);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}