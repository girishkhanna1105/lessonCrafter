import { NextRequest, NextResponse } from "next/server";
import { runPipeline, PipelineProgress } from "@/lib/agents/orchestrator";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { topic, userId, userProfile, isPublic } = await req.json();

  if (!topic) {
    return NextResponse.json({ message: "Topic is required" }, { status: 400 });
  }

  // Use a ReadableStream to stream progress updates to the client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // 1. Insert a stub row first to get a lesson ID
        const supabase = await createClient();
        const { data: stub, error: insertError } = await supabase
          .from("lessons")
          .insert({
            title: topic,
            outline: topic,
            status: "generating",
            user_id: userId || null,
            is_public: isPublic ?? true,
          })
          .select("id")
          .single();

        if (insertError || !stub) {
          send({ type: "error", message: "Failed to create lesson record: " + insertError?.message });
          return;
        }

        // 2. Run the full pipeline with progress callbacks
        const result = await runPipeline(topic, userProfile, (progress: PipelineProgress) => {
          send({ type: "progress", progress });
        });

        // 3. Update the stub row with generated content
        const { error: updateError } = await supabase
          .from("lessons")
          .update({
            title: result.lessonTitle,
            outline: `${topic}\n\n[Subject: ${result.lessonSubject} | Level: ${result.lessonLevel}]`,
            ts_code: result.finalCode,
            status: "generated",
            compile_status: "success",
            compile_error: null,
          })
          .eq("id", stub.id);

        if (updateError) {
          console.error("DB update error:", updateError);
          send({ type: "error", message: "Lesson generated but failed to save: " + updateError.message });
        } else {
          send({ type: "done", lessonId: stub.id, title: result.lessonTitle });
        }
      } catch (err: any) {
        console.error("Pipeline error:", err);
        send({ type: "error", message: err.message || "Pipeline failed" });
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
