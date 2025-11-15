// app/api/repair/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLangfuse, // Import this
  generateLesson,
  getRuntimeRepairPrompt,
  sanitizeTSX,
  validateTSXStructure
} from "@/lib/lessonUtils";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { lessonId, outline, originalCode, errorMessage } =     await req.json();

  if (!lessonId || !outline || !originalCode || !errorMessage) {
    return NextResponse.json(
      { success: false, error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // 1. Create the Langfuse instance
  const langfuse = getLangfuse();

  try {
    console.log(`🔧 [Repair] Initiating runtime repair for Lesson ${lessonId}...`);

    const repairPrompt = getRuntimeRepairPrompt(outline, originalCode, errorMessage);
    const userContent = `Fix the lesson about "${outline}" that failed with: ${errorMessage}`;

    let repairedCode = await generateLesson(
      userContent,
      repairPrompt,
      langfuse // 2. Pass langfuse as 3rd argument
    );
    repairedCode = sanitizeTSX(repairedCode);

    const validationError = validateTSXStructure(repairedCode);
    if (validationError) {
      console.error(`❌ [Repair] Repair FAILED validation: ${validationError}`);
      throw new Error(`Repaired code failed validation: ${validationError}.`);
    }

    console.log(`✅ [Repair] Repair validation successful for Lesson ${lessonId}.`);

    // ... (Supabase update logic is unchanged) ...
    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        ts_code: repairedCode,
        status: "generated",
        compile_status: "success",
        compile_error: null,
      })
      .eq("id", lessonId);

    if (updateError) {
      console.error("❌ [Repair] Supabase update failed:", updateError.message);
      throw new Error("Supabase update failed: " + updateError.message);
    }

    console.log(`✅ [Repair] Lesson ${lessonId} repaired and saved.`);
    
    return NextResponse.json({ success: true, repairedCode });

  } catch (err: any) {
    console.error(`❌ [Repair] Full repair process failed for ${lessonId}:`, err.message);
    
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  } finally {
    // 3. Add this finally block to shut down Langfuse
    if (langfuse) {
      await langfuse.shutdown();
    }
  }
}