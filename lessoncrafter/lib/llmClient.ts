import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groqApiKey = process.env.GROQ_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export interface LlmOptions {
  prompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
  preferGroq?: boolean;
}

/**
 * Resilient multi-provider LLM executor.
 * Automatically tries Groq high-speed models first (openai/gpt-oss-120b, openai/gpt-oss-20b),
 * then gracefully falls back to Gemini (gemini-2.5-flash-lite) on any rate limit or failure.
 */
export async function callResilientLlm(options: LlmOptions): Promise<string> {
  const {
    prompt,
    systemPrompt = "You are an expert STEM curriculum and interactive simulation engineer.",
    jsonMode = false,
    maxTokens = 4096,
    temperature = 0.25,
  } = options;

  const errors: string[] = [];

  // 1. Try Groq ultra-fast inference (high-throughput models first)
  if (groq) {
    const groqModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-20b", "openai/gpt-oss-120b"];
    for (const model of groqModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          temperature,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
        });

        const text = completion.choices[0]?.message?.content?.trim();
        if (text) {
          return text;
        }
      } catch (err: any) {
        errors.push(`[Groq ${model}]: ${err.message}`);
      }
    }
  }

  // 2. Try Gemini with active models (gemini-2.5-flash-lite has active quota)
  if (genAI) {
    const geminiModels = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    for (const modelName of geminiModels) {
      try {
        const generationConfig: any = {
          temperature,
          maxOutputTokens: maxTokens,
          thinkingConfig: { thinkingBudget: 0 },
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        };
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig,
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text()?.trim();
        if (text) {
          return text;
        }
      } catch (err: any) {
        errors.push(`[Gemini ${modelName}]: ${err.message}`);
      }
    }
  }

  throw new Error(`All LLM providers saturated/failed: ${errors.join(" | ")}`);
}
