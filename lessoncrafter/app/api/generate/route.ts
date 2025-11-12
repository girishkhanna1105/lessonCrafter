import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
    console.log("🧠 AI Lesson generation route called!");

  const supabase = await createClient();
  const { lessonId, outline } = await req.json();

  try {
    // 1️⃣ Mark lesson as generating
    await supabase
      .from("lessons")
      .update({ status: "generating" })
      .eq("id", lessonId);

    // 2️⃣ Initialize Groq client
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 3️⃣ Prompt for lesson structure
    const prompt = `
You are an expert educational content generator.
Generate an **interactive JSON lesson** strictly following this structure:

{
  "title": "string — title of the lesson",
  "summary": "string — 1-2 lines overview of the topic",
  "sections": [
    {
      "heading": "string — section title",
      "body": "string — detailed explanation of concept",
      "imagePrompt": "string — describe an image relevant to this section",
      "code": "string — optional, short code snippet",
      "lang": "string — language name if code exists",
      "color": "string — light hex color for section background (e.g. #E8F0FE)"
    }
  ],
  "quiz": [
    {
      "question": "string",
      "options": ["string", "string", "string"],
      "answer": "string"
    }
  ]
}

Rules:
- Respond with **pure JSON** only.
- No text or markdown outside JSON.
- Minimum 2–4 sections.
- Include at least one code example if topic is technical.
- Each section must include a color and imagePrompt.

Topic: "${outline}"
`;

    // 4️⃣ Call Groq API (Llama 3)
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You output valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const raw = response.choices[0]?.message?.content || "{}";

    // 5️⃣ Try parsing JSON safely
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }
    

    // 6️⃣ Save lesson back to Supabase
    await supabase
      .from("lessons")
      .update({
        status: "generated",
        title: parsed.title || outline,
        content_json: parsed,
      })
      .eq("id", lessonId);

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Groq generation error:", error);
    await supabase
      .from("lessons")
      .update({ status: "error" })
      .eq("id", lessonId);
    return NextResponse.json({ success: false, error: String(error) });
  }
}
