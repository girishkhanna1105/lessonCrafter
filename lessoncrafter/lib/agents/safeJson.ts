/**
 * Robust JSON extractor and repair helper for LLM responses.
 * Prevents JSON.parse() crashes from markdown fences, trailing commas,
 * preambles/postambles, or unescaped characters.
 */
export function safeJsonParse<T>(rawText: string, fallback: T): T {
  if (!rawText || typeof rawText !== "string") {
    return fallback;
  }

  // 1. Clean markdown code fences and whitespace
  let cleaned = rawText
    .replace(/^```(?:json)?\s*/im, "")
    .replace(/```\s*$/m, "")
    .trim();

  // 2. Direct parse attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue to repair strategies
  }

  // 3. Extract outermost JSON object or array: { ... } or [ ... ]
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");

  let candidate = "";
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    candidate = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    candidate = cleaned.substring(firstBracket, lastBracket + 1);
  }

  if (candidate) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // 4. Try stripping trailing commas: e.g. ", }" or ", ]"
      const strippedCommas = candidate.replace(/,\s*([}\]])/g, "$1");
      try {
        return JSON.parse(strippedCommas) as T;
      } catch {
        // Continue to fallback
      }
    }
  }

  console.warn("[safeJsonParse] Failed to parse JSON, returning fallback. Raw length:", rawText.length);
  return fallback;
}

