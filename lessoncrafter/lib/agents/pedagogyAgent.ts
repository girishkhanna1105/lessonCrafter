import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "./safeJson";

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface PedagogyBrief {
  intuitiveAnchor: string;
  targetMisconceptions: string[];
  cognitiveMilestones: string[];
  simulationGoal: string;
  recommendedDistractors: string[];
}

export async function runPedagogyAgent(
  topic: string,
  userProfile: any,
  intakeAnswers?: Record<string, string>
): Promise<PedagogyBrief> {
  const level = userProfile?.learner_level || "college";
  const stickingPoint = intakeAnswers?.stickingPoint || "";

  // Compile all diagnostic MCQ selections from user
  const diagnosticSummary = intakeAnswers
    ? Object.entries(intakeAnswers)
        .filter(([k, v]) => k !== "stickingPoint" && Boolean(v))
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n")
    : "";

  const prompt = `You are the Cognitive Scaffolding & Misconception Specialist.
Your mission is to analyze the learner's diagnostic choices and map out the exact pedagogical strategy for this lesson.

TOPIC: "${topic}"
LEARNER LEVEL: ${level}
${diagnosticSummary ? `DIAGNOSTIC INTAKE SELECTIONS:\n${diagnosticSummary}` : ""}
${stickingPoint ? `USER'S SPECIFIC STICKING POINT / QUESTION: "${stickingPoint}"` : ""}

Analyze how learners think about this topic. Output strictly valid JSON with this schema:
{
  "intuitiveAnchor": "A memorable, physically grounded real-world analogy that makes the concept immediately click without jargon",
  "targetMisconceptions": [
    "Misconception 1: The most common false belief learners have on this topic",
    "Misconception 2: A secondary trap or edge-case confusion"
  ],
  "cognitiveMilestones": [
    "Step 1: The foundational intuition",
    "Step 2: The mechanical/mathematical transition",
    "Step 3: The practical application or synthesis"
  ],
  "simulationGoal": "A specific description of what the interactive lab must allow the user to manipulate and observe to dismantle the misconception",
  "recommendedDistractors": [
    "A plausible wrong answer based on Misconception 1",
    "A plausible wrong answer based on Misconception 2"
  ]
}

Return ONLY valid JSON.`;

  // 1. Groq high-speed inference
  if (groq) {
    const candidateModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    for (const modelId of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model: modelId,
          messages: [
            {
              role: "system",
              content: "You are a master cognitive scientist and pedagogical designer. Output strictly valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        });

        const raw = completion.choices[0]?.message?.content || "";
        const parsed = safeJsonParse<PedagogyBrief>(raw, null as any);
        if (parsed && parsed.intuitiveAnchor && parsed.targetMisconceptions?.length) {
          return parsed;
        }
      } catch (err: any) {
        console.warn(`[PedagogyAgent] Groq ${modelId} failed:`, err.message);
      }
    }
  }

  // 2. Gemini fallback
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });
      const res = await model.generateContent(prompt);
      const raw = res.response.text();
      const parsed = safeJsonParse<PedagogyBrief>(raw, null as any);
      if (parsed && parsed.intuitiveAnchor) {
        return parsed;
      }
    } catch (err: any) {
      console.warn("[PedagogyAgent] Gemini fallback failed:", err.message);
    }
  }

  // Fallback defaults if APIs are saturated
  return {
    intuitiveAnchor: `Connect "${topic}" to fundamental physical or computational mechanics.`,
    targetMisconceptions: [
      `Assuming ${topic} behaves linearly under all boundary conditions.`,
      `Over-generalizing the core rule without considering conservation or edge constraints.`,
    ],
    cognitiveMilestones: [
      "Establish physical baseline intuition",
      "Observe parameter variance in simulation",
      "Formulate predictive mastery",
    ],
    simulationGoal: `Provide interactive controls to test and verify how changes impact the state of ${topic}.`,
    recommendedDistractors: [
      `It remains constant regardless of input conditions.`,
      `The effect is instantaneously dissipated without redistribution.`,
    ],
  };
}

