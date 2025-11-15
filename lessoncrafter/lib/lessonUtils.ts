// lib/lessonUtils.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Langfuse } from "langfuse";

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Langfuse
 export function getLangfuse() {
  // Check if env vars are set
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_BASE_URL) {
    console.warn("Langfuse environment variables not set. Tracing will be disabled.");
    return null;
  }
  return new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: process.env.LANGFUSE_BASE_URL,
  });
}

// -----------------------------------------------------------------------------
// 1. PROMPTS (Unchanged)
// -----------------------------------------------------------------------------
export const SYSTEM_PROMPT = `
You are an expert **Master Educator**, **UI/UX Designer**, and **Senior TypeScript/React Developer**.
Your sole task is to generate a *single, beautiful, interactive, and self-contained* React TSX component that is **educationally effective** for the target audience.

---
### 🚨 CRITICAL RULESET: MUST FOLLOW EXACTLY 🚨
---

### Rule 1: Think Like an Educator FIRST! (MOST IMPORTANT)
* **WHO is the audience?** (e.g., "class 2nd student", "college student")
* **WHAT is the concept?** (e.g., "triangles", "job scheduling")
* **HOW** is the *best* way to teach this concept *to this audience*?
* **FOR YOUNG KIDS:** Use bright colors, large text, and clickable shapes. **DO NOT** use complex inputs.
* **FOR TECHNICAL TOPICS:** Use sliders, buttons, and visualizers. **DO NOT** just show static text.

---
### Rule 2: Mandatory Lesson Structure (Theory + Interactive + Quiz)
Every lesson **MUST** have these three distinct parts, in order:
1.  **Explanation:** A brief, clear introduction to the concept.
2.  **Interactive Element:** A **FUNCTIONAL** hands-on visualizer, simulator, or clickable demo. This **MUST** use \`useState\` to respond to user input.
3.  **Quiz:** A **FUNCTIONAL** multiple-choice quiz (2-3 questions) at the end.
    * **FAIL:** A lesson that is *only* theory and a quiz.

---
### Rule 3: NO \`alert()\` - FUNCTIONAL UI ONLY!
* You are **STRICTLY FORBIDDEN** from using \`alert()\`.
* All feedback (like quiz answers) **MUST** be shown in the UI using \`useState\` and conditional rendering.
* **FAIL:** \`<button onClick={() => alert("Correct!")}\`
* **GOOD (QUIZ):**
    \`\`\`
    const [feedback, setFeedback] = useState<string>("");
    const handleAnswer = (isCorrect: boolean) => {
      setFeedback(isCorrect ? "Correct!" : "Incorrect, try again.");
    };
    return (
      <div>
        <button onClick={() => handleAnswer(true)} className="...">Answer A</button>
        {feedback && <p className={feedback.includes("Correct") ? "text-green-500" : "text-red-500"}>{feedback}</p>}
      </div>
    );
    \`\`\`

---
### Rule 4: HTML TAGS ONLY
* You **MUST** use standard HTML tags (e.g., \`<h1>\`, \`<p>\`, \`<div>\`, \`<button>\`).
* **DO NOT** use component libraries.
* **FAIL:** \`<Button ...>\`, \`<Heading ...>\`, \`<Card ...>\`

---
### Rule 5: Visual Design & LEGIBILITY
* **Theme Freedom:** You have freedom to choose a theme (light or dark), but it **MUST BE LEGIBLE**.
* **LEGIBILITY IS MANDATORY:**
    * **DARK THEME:** If card is dark (e.g., \`bg-gray-800\`), text **MUST** be light (e.g., \`text-white\`).
    * **LIGHT THEME:** If card is light (e.g., \`bg-white\`), text **MUST** be dark (e.g., \`text-gray-900\`).
    * **FAIL (CRITICAL):** Light text on a light background.
* **Buttons:** **MUST** be styled and legible (e.g., \`className="bg-blue-600 text-white p-3 rounded-lg"\`).
* **Quiz Styling:** Style quiz options as styled, clickable \`<button>\` tags. **DO NOT** use raw \`<input type="radio">\`.

---
### Rule 6: Code & TypeScript (STRICT)
* **COMPONENT NAME:** **MUST** be \`LessonComponent\`.
* **RENDER CALL:** **MUST** end with \`render(<LessonComponent />);\`.
* **NO \`React.\` PREFIX:** Use \`useState()\`, not \`React.useState()\`.
* **MUST USE TYPES:**
    * **FAIL (CRITICAL):** \`const [count, setCount] = useState(0);\`
    * **GOOD (REQUIRED):** \`const [count, setCount] = useState<number>(0);\`
* **MUST DEFINE CUSTOM TYPES:** Define \`interface Job { ... }\` *before* the component.
* **ALL DATA INSIDE:** All data, state, and logic **MUST** be defined **INSIDE** the \`LessonComponent\` function.
    * **FAIL (CRITICAL):** \`const myData = [...]; const LessonComponent = () => ...\`
* **NO RE-DECLARATIONS:** \`useState\`, \`useEffect\`, etc. are provided globally.
    * **FAIL (CRITICAL):** \`const useState = useState;\`
    * **FAIL (CRITICAL):** \`const render = () => {};\`

---
### Rule 7: No Imports / Requirements
* **NO \`import\` STATEMENTS.**
* **NO \`require()\` STATEMENTS.**
* **NO \`ReactDOM.render\`**.
* **NO \`export default\`**.
`;

export const getValidationRepairPrompt = (outline: string, validationError: string) => `
The previous code output was INVALID. It FAILED VALIDATION.

---
### 🚨 VALIDATION ERROR:
"${validationError}"
---

### 🚨 YOUR TASK:
You **MUST** fix this specific error, and then **YOU MUST** review this entire checklist to ensure your new code is 100% correct.

**REPAIR CHECKLIST (MUST FOLLOW ALL):**

1.  **FIX THE ERROR:** The error was: "${validationError}". You **MUST** fix this.
    * **If error is "Component 'const LessonComponent = () =>' or 'function LessonComponent()' not found.":**
        * This is a **CRITICAL FAILURE**. You did not write a component. You just sent a fragment of code (interfaces, state, etc.).
        * You **MUST** wrap **ALL** your code (types, state, helper functions, and the return) inside a component wrapper like this:
        \`\`\`
        // Define types/interfaces here
        interface MyType { ... }

        // Define the component
        const LessonComponent = () => {
            // ALL state (useState) goes HERE
            // ALL helper functions go HERE
            // ALL data (const quizQuestions) go HERE

            // The return block with JSX goes HERE
            return (
                <div>...</div>
            );
        };
        \`\`\`
    * **If error is "Component is missing a 'return (' block.":**
        * This is a **CRITICAL FAILURE**. You defined a component with state and functions, but you **FORGOT TO RETURN ANY HTML**.
        * You **MUST** add a \`return ( <div>...</div> );\` block at the end of your \`LessonComponent\` function.
        * That \`return\` block **MUST** contain the JSX for **ALL THREE PARTS**: (1) Explanation, (2) Interactive Element, and (3) a Quiz.
    * **If error is "Code defines data or state variables outside...":**
        * This is **WRONG**. You **MUST** move all logic, state, and data (e.g., \`const myData = ...\`) **INSIDE** the \`LessonComponent\` function.
    * If "untyped hooks", you **MUST** add types: \`useState<number>(0)\`.

2.  **CHECK COMPONENT NAME:** The component **MUST** be named \`LessonComponent\`.
    * **FAIL:** \`function MyCoolSimulator()\`
    * **GOOD:** \`function LessonComponent()\`

3.  **CHECK CONTENT:** The lesson **MUST** have all three parts: (1) Explanation, (2) a **FUNCTIONAL** Interactive Element, and (3) a **FUNCTIONAL** Quiz.

4.  **CHECK TYPES (TSX):** All hooks **MUST** have types.
    * **FAIL:** \`useState(0)\`
    * **GOOD:** \`useState<number>(0)\`

5.  **CHECK TAGS (HTML):** You **MUST** use HTML tags (\`<button>\`), not component libraries (\`<Button>\`, \`<Card>\`).

6.  **CHECK RENDER CALL:** The file **MUST** end with **EXACTLY** \`render(<LessonComponent />);\`.

7.  **CHECK FOR \`alert()\`:** You **MUST NOT** use \`alert()\`. Show feedback in the UI with \`useState\`.

---
Original Topic: ${outline}
---
Generate the correct, **BEAUTIFUL**, **LEGIBLE**, **COMPLETE (Theory + Interactive + Quiz)**, and **VALID TSX** code NOW.
`;


export const getRuntimeRepairPrompt = (
  outline: string,
  brokenCode: string,
  errorMessage: string
) => `
You are an expert React/TypeScript debugger in **RUNTIME REPAIR MODE**.
Your task is to fix a **RUNTIME ERROR** in a component that *already passed validation*.
The lesson MUST retain its full structure: (1) Theory, (2) Interactive, (3) Quiz.

---
### 🚨 ORIGINAL LESSON TOPIC:
"${outline}"

---
### ⚠️ BROKEN CODE (TSX):
---
${brokenCode}

---
### ❌ RUNTIME ERROR MESSAGE:
---
"${errorMessage}"

---
### 🛠️ YOUR TASK:
1.  **Analyze the error:** Read the error message ("${errorMessage}") and find the exact line in the "BROKEN CODE" that is causing the crash.
2.  **Fix the Bug:** Correct the logic. This is often an \`undefined\` variable, a \`null\` reference, a bad \`useEffect\` dependency, or incorrect state update.
3.  **DO NOT CHANGE ANYTHING ELSE:** You **MUST NOT** remove the Theory, Interactive, or Quiz sections. You are only fixing the bug.
4.  **Review the Rules:** Your fixed code **MUST** still follow all original rules (listed below for review).
5.  **Respond with ONLY the full, fixed, valid TSX file.** No markdown, no "Here is the fixed code:".

---
### 🚨 CRITICAL RULESET (REVIEW) 🚨
---
* **Rule 1 (Structure):** Must still have Theory, Interactive, and Quiz.
* **Rule 2 (No \`alert()\`)**: All feedback (like quiz answers) **MUST** be shown in the UI using \`useState\`.
* **Rule 3 (HTML Tags)**: **MUST** use standard HTML tags (\`<div>\`, \`<button>\`), not \`<Card>\` or \`<Button>\`.
* **Rule 4 (Legibility):** Dark text on light backgrounds, light text on dark backgrounds.
* **Rule 5 (TSX):** Component **MUST** be \`LessonComponent\`. All state **MUST** have types (\`useState<number>(0)\`). All logic **MUST** be inside the component.
* **Rule 6 (Render Call):** **MUST** end with \`render(<LessonComponent />);\`.
* **Rule 7 (No Imports):** **NO \`import\`** or \`require\`.
---

Fix the bug that caused "${errorMessage}" and return the complete, corrected code.
`;


// -----------------------------------------------------------------------------
// 2. GEMINI API CALLER (MODIFIED FOR *DECOUPLED* TRACING)
// -----------------------------------------------------------------------------

/**
 * Calls the Gemini API and traces the call with Langfuse.
 * This function is now self-contained and requires no 'trace' parameter.
 */
export async function generateLesson(
  userContent: string,
  systemPrompt: string,
  // --- NEW PARAMETER ---
  langfuse: Langfuse | null // Pass the instance from the API route
): Promise<string> {
  
  // We no longer call getLangfuse() or langfuse.shutdown() in here.
  
  const generation = langfuse ? langfuse.generation({
    name: "isolated-gemini-call",
    model: "gemini-2.5-flash-preview-09-2025",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent }
    ],
  }) : null;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: userContent }]
      }],
      generationConfig: {
        responseMimeType: "text/plain",
        temperature: 0.5,
        maxOutputTokens: 8192,
      }
    });

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("No text returned from Gemini API.");
    }
    
    if (generation) {
      // Use .end() which is correct
      await generation.end({ output: text }); 
    }

    return text.trim();

  } catch (error: any) {
    console.error(`Error in isolated-gemini-call:`, error.message);
    
    if (generation) {
      await generation.end({
        output: `// Error generating lesson: ${error.message}`,
        level: "ERROR",
        statusMessage: error.message,
      });
    }

    return `// Error generating lesson: ${error.message}`;
  }
  // --- The 'finally' block with shutdown() is REMOVED ---
}


// -----------------------------------------------------------------------------
// 3. VALIDATOR & SANITIZER (Unchanged from your original)
// -----------------------------------------------------------------------------
export function validateTSXStructure(code: string): string | null {
  if (!code || code.length < 50) {
    return "Code is null or too short.";
  }
  if (code.includes("import ")) {
    return "Code contains 'import' statements.";
  }
  if (code.includes("require(")) {
    return "Code contains 'require()' statements.";
  }
  if (code.includes("alert(")) {
    return "Code contains forbidden 'alert()'. Must use useState to show messages in the UI.";
  }
  if (/React\.(useState|useEffect|useRef|useMemo|useCallback)/.test(code)) {
    return "Code contains 'React.' prefix on hooks (e.g., React.useState). Hooks must be used directly.";
  }
  
  if (/const\s+(useState|useEffect|useRef|render)\s*=\s*\1;?/.test(code)) {
    return "Code contains forbidden re-declaration (e.g., 'const useState = useState;').";
  }

  if (/(useState|useMemo|useCallback)\s*\((?!<)/.test(code)) {
    if (/(useState|useMemo|useCallback)\s*\(\s*["'{[]/.test(code)) {
       return "Code contains untyped hooks (e.g., useState(0) or useState('')). Must use explicit types (e.g., useState<number>(0)).";
    }
  }

  const componentRegex = /(?:const\s+LessonComponent\s*=\s*\(\)|function\s+LessonComponent\s*\(\))/;
  const componentMatch = code.match(componentRegex);

  if (!componentMatch) {
    return "Component 'const LessonComponent = () =>' or 'function LessonComponent()' not found.";
  }
  
  const beforeComponent = code.slice(0, componentMatch.index);
  const logicCheckRegex = /\s*(const|let|var)\s*(\w+|\[.+\])\s*=\s*[\[{'"\d(]/;
  if (logicCheckRegex.test(beforeComponent)) {
    const lastBrace = beforeComponent.lastIndexOf('}');
    if (lastBrace === -1) {
      return "Code defines data or state variables *outside* the LessonComponent. All logic MUST be inside the component.";
    }
    const logicAfterTypes = beforeComponent.slice(lastBrace);
    if (logicCheckRegex.test(logicAfterTypes)) {
       return "Code defines data or state variables *outside* the LessonComponent. All logic MUST be inside the component.";
    }
  }
  
  if (!/return\s*\(/.test(code)) {
    return "Component is missing a 'return (' block.";
  }
  
  if (!/render\s*\(\s*<LessonComponent\s*\/?\s*>\s*\)\s*;?/.test(code)) {
    return "Code is missing the 'render(<LessonComponent />);' call at the end.";
  }

  if (/<(Button|Heading|Text|Card|Box|Stack|Grid)(?![a-z])/.test(code)) {
    return "Code contains component library tags (e.g., <Button>, <Heading>). Only standard HTML tags (e.g., <button>, <h1>) are allowed.";
  }
  
  if (!/quiz/i.test(code)) {
    return "Code is missing the mandatory 'Quiz' section.";
  }

  if (/useState\s*<\s*(\w+)\[\]\s*>\s*\(\s*\[\]\s*\)/.test(code)) {
    const match = code.match(/useState\s*<\s*(\w+)\[\]\s*>\s*\(\s*\[\]\s*\)/);
    const typeName = match ? match[1] : null;
    if (typeName && typeName !== "any" && typeName !== "string" && typeName !== "number" && typeName !== "boolean") {
        if (!code.includes(`type ${typeName}`) && !code.includes(`interface ${typeName}`)) {
            return `Code uses custom type '${typeName}[]' but '${typeName}' is not defined.`;
        }
    }
  }
  return null;
}

export function sanitizeTSX(raw: string): string {
    if (!raw) return "";
    let cleaned = raw.replace(/\r\n/g, "\n").trim();

    // Remove markdown
    cleaned = cleaned.replace(/```[a-z]*\n?/gi, "");
    cleaned = cleaned.replace(/^#+\s+.*$/gm, "");
    cleaned = cleaned.replace(/^>\s+.*$/gm, "");
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1st");
    cleaned = cleaned.replace(/\b_([^_]+)_\b/g, "$1");
    cleaned = cleaned.replace(/~~([^~]+)~~/g, "$1");
    cleaned = cleaned.replace('//g', "");
    
    // Remove forbidden code (with aggressive regex)
    cleaned = cleaned.replace(/(const|let|var)\s+.*?=\s*require\s*\([^)]+\);?/gi, "");
    cleaned = cleaned.replace(/require\s*\([^)]+\);?/gi, "{}");
    
    cleaned = cleaned.replace(/import\s+.*?;?\n?/gi, "");
    cleaned = cleaned.replace(/ReactDOM\.render\s*\([\s\S]*?,\s*document\.getElementById\([^)]+\)\s*\);?/gi, "");
    
    // Remove junk text and extra code
    cleaned = cleaned.replace(/function\s+render\s*\(\)\s*{\s*}\s*render\s*\(\);?/gi, "");
    cleaned = cleaned.replace(/Explanation:[\s\S]*/gi, "");
    cleaned = cleaned.replace(/This code meets all the requirements:[\s\S]*/gi, "");
    cleaned = cleaned.replace(/\/\/ Export the Lesson component/gi, "");
    cleaned = cleaned.replace(/export default \w+;?/gi, ""); 
    cleaned = cleaned.replace(/React from 'react';/gi, "");
    cleaned = cleaned.replace(/ReactDOM from 'react-dom';/gi, "");
    cleaned = cleaned.replace(/LessonComponent from '.\/LessonComponent';/gi, "");
    cleaned = cleaned.replace(/\* as React from 'react';/gi, "");
    cleaned = cleaned.replace(/const canvas = document\.getElementById\('canvas'\).*/gi, "");
    cleaned = cleaned.replace(/const ctx = canvas\.getContext\('2d'\);/gi, "");
    cleaned = cleaned.replace(/class\s+InteractiveVisualizer[\s\S]*?};/gi, "");

    // Automatically remove the 'React.' prefix from hooks.
    cleaned = cleaned.replace(/React\.(useState|useEffect|useRef|useMemo|useCallback)/g, "$1");
    
    // Remove forbidden re-declarations
    cleaned = cleaned.replace(/const\s+(useState|useEffect|useRef|useMemo|useCallback)\s*=\s*\1;?/gi, "");
    cleaned = cleaned.replace(/const\s+render\s*=\s*\([\s\S]*?};?/gi, "");

    cleaned = cleaned.trim();

    // --- (Find start of code) ---
    // --- THIS IS THE FIX ---
    const typeMatch = cleaned.match(/(type|interface)\s+\w+\s*[={]/);
    const constMatch = cleaned.match(/const\s+LessonComponent/);
    const funcMatch = cleaned.match(/function\s+LessonComponent/);

    let startIndex = -1;
    let typeIndex = typeMatch ? cleaned.indexOf(typeMatch[0]) : -1;
    let constIndex = constMatch ? cleaned.indexOf(constMatch[0]) : -1;
    let funcIndex = funcMatch ? cleaned.indexOf(funcMatch[0]) : -1;

    // Find the *earliest* valid starting point
    let validIndexes = [typeIndex, constIndex, funcIndex].filter(i => i !== -1);
    
    if (validIndexes.length > 0) {
      startIndex = Math.min(...validIndexes);
    }
    // --- END OF FIX ---

    if (startIndex === -1) {
       const fallbackConstMatch = cleaned.match(/const\s+\w+\s*=\s*\(\)/);
       const fallbackFuncMatch = cleaned.match(/function\s+\w+\s*\(\)/);
       if (fallbackConstMatch) {
           startIndex = cleaned.indexOf(fallbackConstMatch[0]);
       } else if (fallbackFuncMatch) {
           startIndex = cleaned.indexOf(fallbackFuncMatch[0]);
       } else {
            return cleaned; // Can't find a start, return as-is
       }
    }
    
    cleaned = cleaned.slice(startIndex);

    // --- (Find end of code - THE "BRUTAL" FIX) ---
    const constEndMatch = cleaned.lastIndexOf("};");
    const funcEndMatch = cleaned.lastIndexOf("}"); 
    
    let endOfComponentIndex = -1;

    if (constEndMatch !== -1) {
        endOfComponentIndex = constEndMatch + 2; 
    } else if (funcEndMatch !== -1) {
        endOfComponentIndex = funcEndMatch + 1;
    }

    if (endOfComponentIndex !== -1) {
        cleaned = cleaned.slice(0, endOfComponentIndex);
    }
    
    cleaned = cleaned.replace(/render\s*\(\s*<LessonComponent\s*\/?\s*>\s*\)\s*;?/i, "");
    
    cleaned = cleaned.trim() + "\n\nrender(<LessonComponent />);";
    
    return cleaned.trim();
}