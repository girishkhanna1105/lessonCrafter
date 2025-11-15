// app/api/repair/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateLesson,
  getRuntimeRepairPrompt,
  sanitizeTSX,
  validateTSXStructure
} from "@/lib/lessonUtils";

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
    console.log(`🔧 [Repair] Initiating runtime repair for Lesson ${lessonId}...`);
    console.log(`🔧 [Repair] Error: ${errorMessage}`);

    // 1. Get the specialized RUNTIME repair prompt
    const repairPrompt = getRuntimeRepairPrompt(outline, originalCode, errorMessage);
    const userContent = `Fix the lesson about "${outline}" that failed with: ${errorMessage}`;

    // 2. Call Gemini to generate the fix
    let repairedCode = await generateLesson(userContent, repairPrompt);
    repairedCode = sanitizeTSX(repairedCode);

    // 3. Validate the *repaired* code
    // We are stricter here: if the repair fails validation, we fail fast.
    // We do NOT want to trigger a repair-of-a-repair.
    const validationError = validateTSXStructure(repairedCode);
    if (validationError) {
      console.error(`❌ [Repair] Repair FAILED validation: ${validationError}`);
      throw new Error(`Repaired code failed validation: ${validationError}.`);
    }

    console.log(`✅ [Repair] Repair validation successful for Lesson ${lessonId}.`);

    // 4. Save the successful repair to Supabase
    const { error: updateError } = await supabase
      .from("lessons")
      .update({
        ts_code: repairedCode,
        status: "generated", // Reset status to 'generated'
        compile_status: "success",
        compile_error: null, // Clear the old error
      })
      .eq("id", lessonId);

    if (updateError) {
      console.error("❌ [Repair] Supabase update failed:", updateError.message);
      throw new Error("Supabase update failed: " + updateError.message);
    }

    console.log(`✅ [Repair] Lesson ${lessonId} repaired and saved.`);
    
    // 5. Return the newly repaired code to the client
    return NextResponse.json({ success: true, repairedCode });

  } catch (err: any) {
    console.error(`❌ [Repair] Full repair process failed for ${lessonId}:`, err.message);
    // Do not update Supabase on failure, just report
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}