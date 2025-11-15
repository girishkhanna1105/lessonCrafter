// app/api/regenerate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateLesson,
  SYSTEM_PROMPT,
  getValidationRepairPrompt,
  sanitizeTSX,
  validateTSXStructure
} from "@/lib/lessonUtils";

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
    console.log(`🔄 [Regenerate] Initiating regeneration for Lesson ${lessonId}...`);

    // ---
    // This logic is identical to your original /api/generate route
    // ---
    
    // Attempt 1: Initial Generation
    const userContent = `Create a React lesson about: "${outline}"`;
    let aiCode = await generateLesson(userContent, SYSTEM_PROMPT);
    aiCode = sanitizeTSX(aiCode);

    let validationError = validateTSXStructure(aiCode);

    if (validationError) {
      // Attempt 2: Self-Repair (for validation errors)
      console.warn(`⚠️ [Regenerate] Initial generation failed validation: ${validationError}. Triggering self-repair...`);
      
      const repairPrompt = getValidationRepairPrompt(outline, validationError);
      const repairUserContent = `Fix the validation error for lesson: "${outline}"`;
      
      aiCode = await generateLesson(repairUserContent, repairPrompt);
      aiCode = sanitizeTSX(aiCode);

      // Re-validate the repaired code
      validationError = validateTSXStructure(aiCode);

      if (validationError) {
        console.error(`❌ [Regenerate] Self-repair FAILED validation: ${validationError}`);
        throw new Error(`Self-repair failed validation: ${validationError}.`);
      }
      
      console.log("✅ [Regenerate] Self-repair validation successful.");
    } else {
      console.log("✅ [Regenerate] Initial validation successful.");
    }
    
    // ---
    // End of generate logic
    // ---

    // Success: Save the *new* code to Supabase
    const { error } = await supabase
      .from("lessons")
      .update({
        status: "generated",
        ts_code: aiCode,
        compile_status: "success",
        compile_error: null, // Clear any previous errors
      })
      .eq("id", lessonId);

    if (error) {
      console.error("❌ [Regenerate] Supabase update failed:", error.message);
      throw new Error("Supabase update failed: " + error.message);
    }

    console.log(`✅ [Regenerate] Lesson ${lessonId} regenerated and saved.`);
    
    // Return the new code to the client
    return NextResponse.json({ success: true, generatedCode: aiCode });

  } catch (err: any) {
    // Failure: Log error to Supabase (so user knows it failed)
    console.error(`❌ [Regenerate] Full regeneration failed for ${lessonId}:`, err.message);

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