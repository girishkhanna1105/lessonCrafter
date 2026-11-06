import { NextRequest, NextResponse } from "next/server";
import { runIntakeAgent } from "@/lib/agents/intakeAgent";

export async function POST(req: NextRequest) {
  try {
    const { topic, level } = await req.json();

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    const output = await runIntakeAgent(topic.trim(), level || "college");
    return NextResponse.json({
      success: true,
      questions: output.questions,
    });
  } catch (error: any) {
    console.error("[Intake Route Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate intake" },
      { status: 500 }
    );
  }
}

