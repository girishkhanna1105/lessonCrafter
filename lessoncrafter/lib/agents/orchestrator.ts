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
 * Runs the full 5-agent pipeline.
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

  // ─── AGENT 1: Content Architect ───────────────────────────────────────────
  emit({ content: "running" });
  let contentOutput: LessonContent;
  try {
    contentOutput = await runContentAgent(topic, userProfile);
    emit({ content: "done" });
  } catch (e) {
    emit({ content: "error" });
    throw new Error(`Content Agent failed: ${e}`);
  }

  // Rate limit buffer — stay within 15 RPM free tier
  await sleep(4000);

  // ─── AGENT 2: Interactive Builder ─────────────────────────────────────────
  emit({ interactive: "running" });
  let interactiveOutput: InteractiveOutput;
  try {
    interactiveOutput = await runInteractiveAgent(contentOutput);
    emit({ interactive: "done" });
  } catch (e) {
    emit({ interactive: "error" });
    interactiveOutput = { elements: [] };
  }

  // ─── AGENT 3: Quiz Designer (Groq — no rate limit concern) ────────────────
  emit({ quiz: "running" });
  let quizOutput: QuizOutput;
  try {
    quizOutput = await runQuizAgent(contentOutput);
    emit({ quiz: "done" });
  } catch (e) {
    emit({ quiz: "error" });
    quizOutput = { questions: [] };
  }

  await sleep(4000);

  // ─── AGENT 4: Compiler ─────────────────────────────────────────────────────
  emit({ compiler: "running" });
  let compiledCode: string;
  try {
    compiledCode = await runCompilerAgent(contentOutput, interactiveOutput, quizOutput);
    emit({ compiler: "done" });
  } catch (e) {
    emit({ compiler: "error" });
    throw new Error(`Compiler Agent failed: ${e}`);
  }

  await sleep(4000);

  // ─── AGENT 5: UI Polish ────────────────────────────────────────────────────
  emit({ polish: "running" });
  let finalCode: string;
  try {
    finalCode = await runUIPolishAgent(compiledCode);
    emit({ polish: "done" });
  } catch (e) {
    console.warn("UI Polish agent failed, using compiled code:", e);
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
