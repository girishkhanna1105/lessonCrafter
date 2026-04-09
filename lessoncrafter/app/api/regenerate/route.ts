import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runContentAgent } from "@/lib/agents/contentAgent";
import { runCompilerAgent } from "@/lib/agents/compilerAgent";
import { runUIPolishAgent } from "@/lib/agents/uiPolishAgent";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    await sleep(4000); // Free tier rate limit buffer

    // ─── Agent 4: Compile directly (skip Interactive + Quiz for speed) ────
    console.log("⚙️ [Regenerate] Agent 4: Compiler running...");
    const compiledCode = await runCompilerAgent(
      content,
      { elements: [] },   // No interactive elements — faster
      { questions: [] }   // No quiz — faster
    );
    await sleep(4000);

    // ─── Agent 5: UI Polish ────────────────────────────────────────────────
    console.log("🎨 [Regenerate] Agent 5: UI Polish running...");
    let finalCode: string;
    try {
      finalCode = await runUIPolishAgent(compiledCode);
    } catch {
      finalCode = compiledCode; // Graceful fallback
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