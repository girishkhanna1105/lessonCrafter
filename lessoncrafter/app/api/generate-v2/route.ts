import { NextRequest, NextResponse } from "next/server";
import { runPipeline, PipelineProgress } from "@/lib/agents/orchestrator";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { topic, userId, userProfile, isPublic, intakeAnswers } = await req.json();

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
        let lessonId = `local-${Date.now()}`;
        let dbAvailable = false;
        let supabaseClient: any = null;

        // 1. Attempt Supabase reservation with fail-safe fallback
        try {
          supabaseClient = await createClient();
          const { data: stub, error: insertError } = await supabaseClient
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

          if (!insertError && stub?.id) {
            lessonId = stub.id;
            dbAvailable = true;
          } else {
            console.warn("[generate-v2] Supabase reservation notice:", insertError?.message);
          }
        } catch (dbErr: any) {
          console.warn("[generate-v2] Supabase unavailable (paused or offline), switching to resilient local session:", dbErr.message);
        }

        // 2. Run the full multi-agent pipeline
        const result = await runPipeline(
          topic,
          userProfile,
          intakeAnswers,
          (progress: PipelineProgress) => {
            send({ type: "progress", progress });
          }
        );

        // 3. Format structured outline
        const structuredSummary = `[Subject: ${result.lessonSubject} | Level: ${result.lessonLevel}]\n` +
          `Objectives: ${result.objectives.join("; ")}\n\n` +
          (result.pedagogyBrief?.intuitiveAnchor ? `Intuitive Anchor: ${result.pedagogyBrief.intuitiveAnchor}\n` : "");
        const fullOutline = `${topic}\n\n${structuredSummary}`;

        // 4. Update remote DB if available
        if (dbAvailable && supabaseClient) {
          try {
            await supabaseClient
              .from("lessons")
              .update({
                title: result.lessonTitle,
                outline: fullOutline,
                ts_code: result.finalCode,
                status: "generated",
                compile_status: "success",
                compile_error: null,
              })
              .eq("id", lessonId);
          } catch (updateErr: any) {
            console.warn("[generate-v2] Supabase update warning, returning payload directly:", updateErr.message);
          }
        }

        // 5. Always deliver the complete lesson payload directly to the client
        send({
          type: "done",
          lessonId,
          title: result.lessonTitle,
          outline: fullOutline,
          ts_code: result.finalCode,
        });

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
