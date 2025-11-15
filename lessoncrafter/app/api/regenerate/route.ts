// app/api/regenerate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getLangfuse, // Import this
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

  // 1. Create the Langfuse instance
  const langfuse = getLangfuse();

  try {
    console.log(`🔄 [Regenerate] Initiating regeneration for Lesson ${lessonId}...`);
    
    // Attempt 1: Initial Generation
    const userContent = `Create a React lesson about: "${outline}"`;
    let aiCode = await generateLesson(
      userContent, 
      SYSTEM_PROMPT, 
      langfuse // 2. Pass langfuse as 3rd argument
    );
    aiCode = sanitizeTSX(aiCode);

    let validationError = validateTSXStructure(aiCode);

    if (validationError) {
      // Attempt 2: Self-Repair (for validation errors)
      console.warn(`⚠️ [Regenerate] Initial generation failed validation: ${validationError}. Triggering self-repair...`);
      
      const repairPrompt = getValidationRepairPrompt(outline, validationError);
      const repairUserContent = `Fix the validation error for lesson: "${outline}"`;
      
      aiCode = await generateLesson(
        repairUserContent, 
        repairPrompt, 
        langfuse // 2. Pass langfuse as 3rd argument
      );
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
    
    // ... (Supabase update logic is unchanged) ...
    const { error } = await supabase
      .from("lessons")
      .update({
        status: "generated",
        ts_code: aiCode,
        compile_status: "success",
        compile_error: null,
      })
      .eq("id", lessonId);

    if (error) throw new Error("Supabase update failed: " + error.message);

    console.log(`✅ [Regenerate] Lesson ${lessonId} regenerated and saved.`);
    
    return NextResponse.json({ success: true, generatedCode: aiCode });

  } catch (err: any) {
    // ... (Supabase error logic is unchanged) ...
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
  } finally {
    // 3. Add this finally block to shut down Langfuse
    if (langfuse) {
      await langfuse.shutdown();
    }
  }
}