import { runContentAgent, LessonContent } from "./contentAgent";
import { runInteractiveAgent, InteractiveOutput } from "./interactiveAgent";
import { runQuizAgent, QuizOutput } from "./quizAgent";
import { runCompilerAgent } from "./compilerAgent";
import { runUIPolishAgent } from "./uiPolishAgent";

export type AgentStatus = "waiting" | "running" | "done" | "error";

export interface PipelineProgress {
  content: AgentStatus;
  interactive: AgentStatus;
  quiz: AgentStatus;
  compiler: AgentStatus;
  polish: AgentStatus;
}

export interface PipelineResult {
  finalCode: string;
  lessonTitle: string;
  lessonSubject: string;
  lessonLevel: string;
  objectives: string[];
}

/**
 * Runs the optimized 5-agent pipeline with parallelized generation.
 * @param topic The lesson topic
 * @param userProfile The logged-in user's profile from DB
 * @param onProgress Callback for streaming status updates to the UI
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runPipeline(
  topic: string,
  userProfile: any,
  onProgress: (progress: PipelineProgress) => void
): Promise<PipelineResult> {
  const progress: PipelineProgress = {
    content: "waiting",
    interactive: "waiting",
    quiz: "waiting",
    compiler: "waiting",
    polish: "waiting",
  };

  const emit = (update: Partial<PipelineProgress>) => {
    Object.assign(progress, update);
    onProgress({ ...progress });
  };

  // ─── AGENT 1: Content Architect (Gemini) ──────────────────────────────────
  emit({ content: "running" });
  let contentOutput: LessonContent;
  try {
    contentOutput = await runContentAgent(topic, userProfile);
    emit({ content: "done" });
  } catch (e) {
    emit({ content: "error" });
    throw new Error(`Content Agent failed: ${e}`);
  }

  // ─── AGENT 2 & AGENT 3: Concurrent Execution (Promise.all) ───────────────
  // Agent 2 runs on Gemini, Agent 3 runs on Groq (independent rate limit pools)
  emit({ interactive: "running", quiz: "running" });

  const [interactiveResult, quizResult] = await Promise.allSettled([
    runInteractiveAgent(contentOutput),
    runQuizAgent(contentOutput),
  ]);

  let interactiveOutput: InteractiveOutput;
  if (interactiveResult.status === "fulfilled") {
    interactiveOutput = interactiveResult.value;
    emit({ interactive: "done" });
  } else {
    console.warn("[Orchestrator] Interactive Agent failed:", interactiveResult.reason);
    interactiveOutput = { elements: [] };
    emit({ interactive: "error" });
  }

  let quizOutput: QuizOutput;
  if (quizResult.status === "fulfilled") {
    quizOutput = quizResult.value;
    emit({ quiz: "done" });
  } else {
    console.warn("[Orchestrator] Quiz Agent failed:", quizResult.reason);
    quizOutput = { questions: [] };
    emit({ quiz: "error" });
  }

  // Micro-buffer for Gemini concurrency safety
  await sleep(1000);

  // ─── AGENT 4: Compiler (Gemini) ───────────────────────────────────────────
  emit({ compiler: "running" });
  let compiledCode: string;
  try {
    compiledCode = await runCompilerAgent(contentOutput, interactiveOutput, quizOutput);
    emit({ compiler: "done" });
  } catch (e) {
    emit({ compiler: "error" });
    throw new Error(`Compiler Agent failed: ${e}`);
  }

  // ─── AGENT 5: UI Polish (Gemini) ──────────────────────────────────────────
  emit({ polish: "running" });
  let finalCode: string;
  try {
    finalCode = await runUIPolishAgent(compiledCode);
    emit({ polish: "done" });
  } catch (e) {
    console.warn("[Orchestrator] UI Polish agent failed, falling back to compiled code:", e);
    finalCode = compiledCode;
    emit({ polish: "done" });
  }

  return {
    finalCode,
    lessonTitle: contentOutput.title,
    lessonSubject: contentOutput.subject,
    lessonLevel: contentOutput.level,
    objectives: contentOutput.learning_objectives,
  };
}
