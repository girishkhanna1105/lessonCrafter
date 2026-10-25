import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch lessons count and recent lessons
    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("id, title, outline, status, compile_error, created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = lessons?.length || 0;
    const ready = lessons?.filter((l) => l.status === "generated").length || 0;
    const failed = lessons?.filter((l) => l.status === "failed" || Boolean(l.compile_error)).length || 0;
    const generating = lessons?.filter((l) => l.status === "generating").length || 0;

    return NextResponse.json({
      success: true,
      metrics: {
        total,
        ready,
        failed,
        generating,
        successRate: total > 0 ? Math.round((ready / total) * 100) : 100,
      },
      lessons: lessons || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST: Reset stuck generation tasks older than 5 minutes
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { action, lessonId } = await req.json();

    if (action === "reset_stuck") {
      const { error } = await supabase
        .from("lessons")
        .update({
          status: "failed",
          compile_error: "Generation timed out or worker process aborted. Reset by Admin.",
        })
        .eq("status", "generating");

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Stuck lessons reset successfully." });
    }

    if (action === "delete" && lessonId) {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: "Lesson deleted successfully." });
    }

    return NextResponse.json({ success: false, error: "Invalid admin action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
