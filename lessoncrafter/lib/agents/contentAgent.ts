import { GoogleGenerativeAI } from "@google/generative-ai";
import { safeJsonParse } from "./safeJson";
import { PedagogyBrief } from "./pedagogyAgent";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ContentSubsection {
  title: string;
  content: string;
}

export interface ContentSection {
  title: string;
  explanation: string;
  subsections?: ContentSubsection[];
  key_points: string[];
  real_world_example: string;
  misconception_callout?: string;
  code_snippet?: string;
}

export interface WorkedExample {
  title: string;
  scenario: string;
  steps: {
    step_number: number;
    title: string;
    description: string;
  }[];
  insight: string;
}

export interface LessonContent {
  title: string;
  subject: string;
  level: string;
  learning_objectives: string[];
  prerequisites: string[];
  introduction: string;
  intuitive_anchor?: string;
  sections: ContentSection[];
  worked_example?: WorkedExample;
  summary: string;
}

export async function runContentAgent(
  topic: string,
  userProfile: any,
  pedagogyBrief?: PedagogyBrief,
  intakeAnswers?: Record<string, string>
): Promise<LessonContent> {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.35,
    }
  });

  const roleContext = userProfile?.role === "teacher"
    ? `Target Audience: TEACHER classroom delivery. Provide rigorous curriculum alignment, in-depth theoretical explanations, and instructional clarity.
       Teaching style: ${userProfile?.teaching_style || "conceptual derivation"}
       Level: ${userProfile?.grade_levels?.[0] || userProfile?.learner_level || "College STEM"}`
    : `Target Audience: STUDENT self-study masterclass. Provide deep, intuitive, first-principles explanations that build mastery step-by-step.
       Grade/Year: ${userProfile?.grade_or_year || userProfile?.learner_level || "Undergraduate / Advanced"}
       Learning Goal: ${userProfile?.learning_goal || intakeAnswers?.goal || "deep_intuition"}`;

  const pedagogyContext = pedagogyBrief
    ? `
PEDAGOGICAL CALIBRATION:
- Intuitive Anchor Analogy: "${pedagogyBrief.intuitiveAnchor}"
- Target Misconceptions to Deconstruct:
${pedagogyBrief.targetMisconceptions.map((m, i) => `  ${i + 1}. ${m}`).join("\n")}
- Cognitive Milestones:
${pedagogyBrief.cognitiveMilestones.map((m, i) => `  ${i + 1}. ${m}`).join("\n")}
`
    : "";

  const diagnosticSummary = intakeAnswers
    ? Object.entries(intakeAnswers)
        .filter(([k, v]) => k !== "stickingPoint" && Boolean(v))
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n")
    : "";

  const prompt = `You are the Lead Pedagogical Content Architect.
Your task is to write an exhaustive, textbook-grade academic masterclass on: "${topic}".

CRITICAL LENGTH & DEPTH MANDATE:
- Target Volume: Comprehensive 6 to 8 full printed pages (approximately 3,200 to 4,800 words total).
- DO NOT summarize or write brief outlines. Every concept must be explored deeply from first principles.
- Use the hierarchical "subsections" structure to unpack specific mathematical proofs, mechanical foundations, and real-world architectures with academic precision.

USER CONTEXT:
${roleContext}
${diagnosticSummary ? `LEARNER DIAGNOSTIC CHOICES:\n${diagnosticSummary}` : ""}
${intakeAnswers?.stickingPoint ? `USER'S SPECIFIC STICKING POINT / CHALLENGE: "${intakeAnswers.stickingPoint}"` : ""}

${pedagogyContext}

Generate an exhaustive masterclass document matching this schema (Return ONLY valid JSON):
{
  "title": "Authoritative and compelling lesson title",
  "subject": "Domain (e.g. Quantum Physics, Computer Science, Biochemistry)",
  "level": "Beginner | Intermediate | Advanced",
  "learning_objectives": [
    "Demonstrable competency 1 with analytical rigor",
    "Demonstrable competency 2 with analytical rigor",
    "Demonstrable competency 3 with analytical rigor",
    "Demonstrable competency 4 with analytical rigor",
    "Demonstrable competency 5 with analytical rigor"
  ],
  "prerequisites": [
    "Prerequisite concept 1 with theoretical rationale",
    "Prerequisite concept 2 with theoretical rationale",
    "Prerequisite concept 3 with theoretical rationale"
  ],
  "introduction": "An exhaustive 4-paragraph introductory thesis detailing historical context, classical limits, the necessity of the current model, and an architectural roadmap.",
  "intuitive_anchor": "A vivid, physically grounded mental model or analogy that unifies the entire concept.",
  "sections": [
    {
      "title": "01. Core Principles & Historical Context",
      "explanation": "Clear overview of this module (2 paragraphs framing the fundamental concepts and background).",
      "subsections": [
        {
          "title": "1.1 The Breakdown of Previous Models & Key Discoveries",
          "content": "Dense, multi-paragraph analysis (2-3 paragraphs, 250+ words) detailing the exact challenges and anomalies of predecessor approaches."
        },
        {
          "title": "1.2 Core Formulations & Reference Framework",
          "content": "Dense, multi-paragraph breakdown (2-3 paragraphs, 250+ words) establishing the primary variables, degrees of freedom, and foundational rules."
        }
      ],
      "key_points": [
        "In-depth takeaway 1 with clear explanation",
        "In-depth takeaway 2 with clear explanation",
        "In-depth takeaway 3 with clear explanation",
        "In-depth takeaway 4 with clear explanation"
      ],
      "real_world_example": "Comprehensive real-world case study with concrete metrics and outcomes.",
      "misconception_callout": "Detailed misconception analysis: common trap, why it tempts learners, and the correct way to think about it.",
      "code_snippet": "Formal mathematical equation or code block with parameter annotations"
    },
    {
      "title": "02. Core Mechanisms & Dynamic Behaviors",
      "explanation": "Clear overview of the governing mechanisms and equilibrium conditions.",
      "subsections": [
        {
          "title": "2.1 Step-by-Step State Transitions & Interactions",
          "content": "Deep conceptual derivation (2-3 paragraphs, 250+ words) exploring how system inputs influence intermediate states."
        },
        {
          "title": "2.2 Conservation Laws & System Bounds",
          "content": "Deep conceptual derivation (2-3 paragraphs, 250+ words) exploring key conservation rules and theoretical bounds."
        }
      ],
      "key_points": [ ... ],
      "real_world_example": "...",
      "misconception_callout": "...",
      "code_snippet": "..."
    },
    {
      "title": "03. Mathematical Formulation & Derivations",
      "explanation": "Overview of quantitative formulations and equations.",
      "subsections": [
        {
          "title": "3.1 Step-by-Step Analytical Derivation",
          "content": "Full mathematical progression (2-3 paragraphs, 250+ words) from fundamental principles to closed-form solutions."
        },
        {
          "title": "3.2 Key Quantities & Stability Bounds",
          "content": "In-depth quantitative treatment (2-3 paragraphs, 250+ words) analyzing stability bounds and key performance metrics."
        }
      ],
      "key_points": [ ... ],
      "real_world_example": "...",
      "misconception_callout": "...",
      "code_snippet": "..."
    },
    {
      "title": "04. Real-World Architecture & Engineering Implementation",
      "explanation": "Overview of practical real-world implementations.",
      "subsections": [
        {
          "title": "4.1 System Topology & Practical Pipeline",
          "content": "Detailed real-world deployment (2-3 paragraphs, 250+ words) covering implementation details and best practices."
        },
        {
          "title": "4.2 Critical Trade-Off Analysis: Performance vs Complexity",
          "content": "Detailed real-world deployment (2-3 paragraphs, 250+ words) exploring architectural choices and tradeoffs."
        }
      ],
      "key_points": [ ... ],
      "real_world_example": "...",
      "misconception_callout": "...",
      "code_snippet": "..."
    },
    {
      "title": "05. Edge Cases, Failure Modes & Boundary Conditions",
      "explanation": "Overview of unusual edge cases, failure modes, and boundary states.",
      "subsections": [
        {
          "title": "5.1 Threshold Behavior & Asymptotic Limits",
          "content": "Rigorous investigation (2-3 paragraphs, 250+ words) of behavior as variables approach boundary conditions."
        },
        {
          "title": "5.2 Error Handling & Recovery Strategies",
          "content": "Rigorous investigation (2-3 paragraphs, 250+ words) on fail-safe mechanisms and mitigation strategies."
        }
      ],
      "key_points": [ ... ],
      "real_world_example": "...",
      "misconception_callout": "...",
      "code_snippet": "..."
    },
    {
      "title": "06. Practical Applications & Modern Frontiers",
      "explanation": "Overview of modern industry applications and cutting-edge directions.",
      "subsections": [
        {
          "title": "6.1 Comparative Paradigm Analysis",
          "content": "In-depth comparison (2-3 paragraphs, 250+ words) contrasting competing schools of thought and alternative representations."
        },
        {
          "title": "6.2 Open Problems & Next-Generation Horizons",
          "content": "In-depth exploration (2-3 paragraphs, 250+ words) of unresolved questions and emergent methodologies."
        }
      ],
      "key_points": [ ... ],
      "real_world_example": "...",
      "misconception_callout": "...",
      "code_snippet": "..."
    }
  ],
  "worked_example": {
    "title": "Comprehensive Challenge Problem: Step-by-Step Analytical Deconstruction",
    "scenario": "A rich, complex challenge problem scenario testing the concepts learned.",
    "steps": [
      { "step_number": 1, "title": "Boundary Analysis & Parameter Extraction", "description": "Extracting all known variables, boundary constraints, and target unknowns." },
      { "step_number": 2, "title": "Governing Law Formulation", "description": "Selecting the applicable analytical strategy and setting up governing equations." },
      { "step_number": 3, "title": "Quantitative Evaluation & Derivation", "description": "Step-by-step execution of mathematical operations, showing transitions clearly." },
      { "step_number": 4, "title": "Conservation Laws & Asymptotic Sanity Checks", "description": "Validating the calculated values against conservation laws and physical reality." },
      { "step_number": 5, "title": "Engineering Trade-Off & Practical Optimization", "description": "Analyzing how real-world tolerances affect the idealized result." }
    ],
    "insight": "The critical insight differentiating superficial memorization from true masterclass competency."
  },
  "summary": "An executive synthesis consolidating the core laws, trade-offs, and mental models into a definitive mental checklist."
}

Generate exactly 6 comprehensive modules with detailed subsections. Every subsection must have rich, substantive paragraphs with technical depth.`;

  const fallbackContent: LessonContent = {
    title: topic,
    subject: "Advanced Sciences",
    level: userProfile?.learner_level || "College",
    learning_objectives: [
      "Deconstruct foundational mechanics from first-principles",
      "Model parameter variances and critical threshold states",
      "Identify and debunk common cognitive misconceptions",
      "Apply analytical frameworks to solve concrete challenge problems"
    ],
    prerequisites: ["Fundamental mathematical literacy and scientific reasoning"],
    introduction: `In this comprehensive exploration of ${topic}, we investigate the foundational mechanics, mathematical representations, and practical applications that govern the system.\n\nTraditional approaches frequently reduce ${topic} to rote formulas without establishing the intuitive physical models that make the behavior predictable. By analyzing the system from first principles, we uncover how core variables interact dynamically.\n\nThis masterclass guides you through rigorous theoretical derivation, interactive state space experimentation, and diagnostic problem solving.`,
    intuitive_anchor: pedagogyBrief?.intuitiveAnchor || `An intuitive physical model grounding ${topic} in observable mechanics.`,
    sections: [
      {
        title: "01. First-Principles Mechanics & Core Governing Constraints",
        explanation: `At the fundamental level, ${topic} is defined by the interaction between state variables and universal conservation constraints. Rather than viewing the system as an isolated set of static rules, it must be understood as a dynamic equilibrium where each parameter exerts a measurable influence on adjacent states.\n\nWhen external perturbations are introduced, the internal state coordinates adjust to preserve boundary constraints. Understanding these initial coordinates allows us to predict whether the system will exhibit stable damping or transition into non-linear divergence.\n\nBy establishing these boundary conditions early, we ensure that subsequent mathematical formulations remain anchored to observable physical realities.`,
        key_points: [
          "State variables establish the baseline degrees of freedom for the system.",
          "Boundary constraints dictate permissible transitions between operational phases.",
          "Conservation laws govern energy and information flow across all boundaries.",
          "Perturbations reveal the underlying stability margins of the equilibrium state."
        ],
        real_world_example: `High-reliability instrumentation and industrial verification frameworks.`,
        misconception_callout: pedagogyBrief?.targetMisconceptions?.[0] || "Assuming linear proportional scaling across non-linear boundary thresholds.",
        code_snippet: `// Governing State Formulation\nconst state = { equilibrium: true, dampingRatio: 0.707 };`
      },
      {
        title: "02. Mathematical Formulation & Parameter Transitions",
        explanation: `Quantitative analysis of ${topic} requires evaluating the transfer functions that map input modulations to system responses. Small shifts in input frequency or amplitude can produce sudden state bifurcations if critical thresholds are crossed.\n\nBy examining the derivative of the response curve with respect to each independent variable, we determine the sensitivity matrix of the system. This allows researchers and engineers to identify which parameters have high leverage over final performance.\n\nFurthermore, observing how transient states decay into steady-state equilibrium provides direct insight into intrinsic damping factors and dissipation rates.`,
        key_points: [
          "Transfer functions formalize the mathematical relationship between input and output.",
          "Sensitivity matrices reveal high-leverage control parameters.",
          "Threshold conditions define the boundaries where bifurcations occur.",
          "Transient state decay rates quantify intrinsic system dissipation."
        ],
        real_world_example: `Active feedback control systems and resonance damping in physical structures.`,
        misconception_callout: pedagogyBrief?.targetMisconceptions?.[1] || "Treating transient fluctuations as permanent shifts in equilibrium.",
        code_snippet: `// Transfer response function\nfunction evaluateResponse(input, damping) { return input / Math.sqrt(1 + damping * damping); }`
      },
      {
        title: "03. Practical Synthesis & Edge Case Analysis",
        explanation: `In practical application, theoretical models must survive edge conditions and external noise. Real-world implementations inevitably introduce parasitic impedances, thermal fluctuations, and measurement uncertainties that deviate from idealized assumptions.\n\nRobust mastery requires diagnosing these edge failure modes before they compromise system integrity. By analyzing failure patterns under stress, we learn to implement safeguards, error-correction loops, and redundant checks.\n\nThis section bridges the gap between pure academic theory and mission-critical engineering execution.`,
        key_points: [
          "Parasitic parameters introduce real-world deviations from idealized equations.",
          "Stress testing reveals latent failure modes under extreme parameter combinations.",
          "Closed-loop error correction preserves operational integrity in noisy environments.",
          "Defensive architecture separates acceptable operational tolerance from critical failure."
        ],
        real_world_example: `Mission-critical fault-tolerant computing and aerospace telemetry.`,
        misconception_callout: "Assuming idealized textbook equations hold without verifying parasitic boundary losses.",
      }
    ],
    worked_example: {
      title: "Step-by-Step Scenario Analysis & Verification",
      scenario: `Analyze the equilibrium state of ${topic} when the primary parameter is increased by 50% under constrained boundary conditions.`,
      steps: [
        { step_number: 1, title: "Parameter Extraction", description: "Isolate baseline coordinates and verify that conservation laws are initialized properly." },
        { step_number: 2, title: "Formulate State Equation", description: "Apply the governing transfer equations to calculate the intermediate response." },
        { step_number: 3, title: "Evaluate Non-Linear Boundary Shift", description: "Account for threshold effects and calculate the resulting steady-state coordinates." },
        { step_number: 4, title: "Sanity & Conservation Check", description: "Verify that the final equilibrium satisfies all energy and information constraints." }
      ],
      insight: "True mastery consists of predicting where non-linear thresholds alter the fundamental rules of the system."
    },
    summary: `Mastery of ${topic} combines intuitive physical models, quantitative mathematical formulations, and defensive edge-case verification. By understanding how core parameters interact dynamically, you can systematically analyze and predict system behavior in any environment.`
  };

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const parsed = safeJsonParse<LessonContent>(rawText, fallbackContent);
    return parsed.sections && parsed.sections.length >= 2 ? parsed : fallbackContent;
  } catch (err: any) {
    console.error("[ContentAgent] Gemini failed, using fallback:", err.message);
    return fallbackContent;
  }
}
