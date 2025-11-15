// app/api/generate/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  // --- IMPORT THE NEW FUNCTIONS ---
  getLangfuse,
  generateLesson,
  SYSTEM_PROMPT,
  getValidationRepairPrompt,
  sanitizeTSX,
  validateTSXStructure
} from "@/lib/lessonUtils";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { lessonId, outline } = await req.json();

  if (!lessonId || !outline)
    return NextResponse.json({ success: false, error: "Missing parameters" });

  // --- 1. Create the Langfuse instance ---
  const langfuse = getLangfuse();

  try {
    // Attempt 1: Initial Generation
    console.log(`🧠 Generating lesson for: "${outline}"`);
    const userContent = `Create a React lesson about: "${outline}"`;
    
    let aiCode = await generateLesson(
      userContent,
      SYSTEM_PROMPT,
      langfuse // --- 2. Pass the instance ---
    );
    aiCode = sanitizeTSX(aiCode);

    let validationError = validateTSXStructure(aiCode);

    if (validationError) {
      // Attempt 2: Self-Repair
      console.warn(`⚠️ Initial generation failed validation: ${validationError}. Triggering self-repair...`);
      
      const repairPrompt = getValidationRepairPrompt(outline, validationError);
      const repairUserContent = `Fix the validation error for lesson: "${outline}"`;
      
      aiCode = await generateLesson(
        repairUserContent,
        repairPrompt,
        langfuse // --- 2. Pass the instance again ---
      );
      aiCode = sanitizeTSX(aiCode);

      // Re-validate the repaired code
      validationError = validateTSXStructure(aiCode);

      if (validationError) {
        console.error(`❌ Self-repair FAILED validation: ${validationError}`);
        throw new Error(`Self-repair failed validation: ${validationError}. Raw output: ${aiCode}`);
      }
      
      console.log("✅ Self-repair validation successful.");
    } else {
      console.log("✅ Initial validation successful.");
    }

    // Success: Save to Supabase
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

    console.log("✅ Lesson generated and saved successfully.");
    return NextResponse.json({ success: true });

  } catch (err: any) {
    // Failure: Log error to Supabase
    console.error("❌ Generation failed:", err.message);

    await supabase
      .from("lessons")
      .update({
        status: "error",
        compile_status: "failed",
        compile_error: err.message,
      })
      .eq("id", lessonId);

    return NextResponse.json({ success: false, error: err.message });
  } finally {
    // --- 3. This is the new, crucial part ---
    // Wait for Langfuse to finish *before* the function terminates
    if (langfuse) {
      await langfuse.shutdown();
    }
  }
}