import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = await createClient();
  const { lessonId, outline } = await req.json();

  if (!lessonId || !outline)
    return NextResponse.json({ success: false, error: "Missing parameters" });

  // 🧠 Enhanced Prompt with STRICT browser-compatible requirements
  const SYSTEM_PROMPT = `
You are an expert TypeScript + React educator and interactive lesson designer.
Your job is to generate a *self-contained, interactive React component (TSX)* for a given topic.

---

### 🧩 CRITICAL RULES - MUST FOLLOW EXACTLY:

1. **Output ONLY valid TypeScript/React code - NO markdown, NO explanations, NO text**
   - DO NOT wrap code in markdown blocks like \`\`\`typescript or \`\`\`
   - Output should be PURE CODE with no formatting

2. **Structure must be EXACTLY (NO import statements!):**
   const LessonComponent = () => {
     const [state, setState] = useState(initialValue);
     // component logic here
     return (
       <div>...</div>
     );
   };

   render(<LessonComponent />);

3. **Component MUST be named "LessonComponent" - not any other name!**
   ❌ NO: const MicroeconomicsComponent = () => ...
   ❌ NO: const MyComponent = () => ...
   ✅ YES: const LessonComponent = () => ...

4. **DO NOT include import statements!** 
   ❌ NO: import React, { useState } from 'react';
   ❌ NO: import { useState } from 'react';
   ✅ YES: Just use useState, useEffect directly - they're provided automatically

4. **BROWSER-ONLY CODE - ABSOLUTELY NO:**
   ❌ import statements (React hooks are pre-imported)
   ❌ require() statements
   ❌ Node.js modules (fs, path, process, etc.)
   ❌ External npm packages
   ❌ Dynamic imports or lazy loading
   ❌ Server-side APIs or fetch calls
   ✅ ONLY use: useState, useEffect, and basic JavaScript/TypeScript

4. **Code Requirements:**
   - Use functional components with hooks (useState, useEffect ONLY)
   - Use Tailwind CSS classes for ALL styling
   - Make it interactive with sliders, buttons, inputs, or animations
   - Use ONLY browser-native APIs (Math, Date, Array methods, etc.)
   - Ensure responsive design with proper padding, colors, and shadows
   - Write PLAIN code - NO markdown formatting like **bold**, *italic*, or ~~strikethrough~~
   - Keep all math operators intact (*, /, +, -, etc.)
   - ALWAYS add null checks and error handling
   - Use optional chaining (?.) and nullish coalescing (??)

5. **Based on topic type, create UNIQUE designs:**
   - Math/Science: Interactive visualizations with real-time updates using sliders/inputs
     * Use gradients, shadows, glassmorphism effects
     * Consider dark themes with neon accents or light themes with soft pastels
   - Concepts: Quiz, explorer, or step-by-step guide with buttons
     * Use card layouts, tabs, or accordion styles
     * Experiment with different color schemes (blue/purple, green/teal, orange/pink)
   - Programming: Algorithm visualizer with step-through controls
     * Use monospace fonts, code-like styling
     * Consider terminal-inspired themes or modern editor aesthetics
   - General: Interactive tutorial with examples and user controls
     * Mix different UI patterns (split screens, modals, slideshows)
     * Use unique typography and spacing

6. **Design Variety Requirements:**
   - Vary your color schemes: Don't always use gray-900/blue-purple gradients
   - Experiment with: emerald, cyan, rose, amber, violet, fuchsia colors
   - Use different layout patterns: full-width, centered cards, split-screen, grid
   - Mix up component styles: rounded corners (xl, 2xl, 3xl), shadows, borders
   - Try different text sizes and hierarchies
   - Add unique interactive elements: progress bars, animated transitions, hover effects

6. **DO NOT include:**
   - Markdown code blocks (\`\`\`)
   - Markdown formatting (**bold**, *italic*, ~~strikethrough~~)
   - Comments outside the code
   - Explanatory text before or after code
   - Multiple component definitions
   - ANY require() statements
   - ANY external imports beyond React hooks
   - Generic gray-900 backgrounds every time - BE CREATIVE!

---

### ✅ VALID EXAMPLE:

const LessonComponent = () => {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const c = Math.sqrt(a*a + b*b).toFixed(2);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Pythagorean Theorem Visualizer
      </h2>
      <p className="mb-6 text-gray-300 leading-relaxed">
        Move the sliders to change the sides of the right triangle and see how the hypotenuse changes!
      </p>
      <div className="space-y-6 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <label className="block text-sm font-semibold text-blue-400 mb-2">
            Side a: {a}
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={a} 
            onChange={(e) => setA(Number(e.target.value))} 
            className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <label className="block text-sm font-semibold text-purple-400 mb-2">
            Side b: {b}
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={b} 
            onChange={(e) => setB(Number(e.target.value))} 
            className="w-full h-2 bg-gray-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-center">
        <div className="text-lg text-blue-100 mb-2">Hypotenuse (c)</div>
        <div className="text-4xl font-bold">
          c = √(a² + b²) = {c}
        </div>
      </div>
    </div>
  );
};

render(<LessonComponent />);

### 🎨 DESIGN VARIETY EXAMPLES:

Example 1 - Vibrant Theme:
<div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-8">
  <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
    ...
  </div>
</div>

Example 2 - Clean Modern:
<div className="min-h-screen bg-white p-8">
  <div className="max-w-3xl mx-auto">
    <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl p-8 text-white shadow-xl">
      ...
    </div>
  </div>
</div>

Example 3 - Dark Neon:
<div className="min-h-screen bg-black p-8">
  <div className="max-w-4xl mx-auto border-2 border-cyan-400 rounded-xl p-8 bg-gray-900/80">
    <h1 className="text-4xl font-bold text-cyan-400 mb-6">...</h1>
    ...
  </div>
</div>

Example 4 - Warm Gradient:
<div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-8">
  <div className="max-w-5xl mx-auto bg-white rounded-2xl p-10 shadow-2xl">
    ...
  </div>
</div>

REMEMBER: 
- Output ONLY the code above, nothing else!
- NO import statements!
- NO require() statements!
- ONLY use browser-native JavaScript APIs
- This code runs in a browser sandbox with react-live
- BE CREATIVE WITH COLORS AND LAYOUTS - Don't default to gray every time!
`;

  try {
    // 🧠 Step 1: Generate
    let aiCode = await generateLesson(outline, SYSTEM_PROMPT);
    console.log("🧠 Groq RAW output:\n", aiCode);
    
    aiCode = sanitizeTSX(aiCode);
    console.log("🧹 After sanitization:\n", aiCode);

    // 🔍 Additional validation: Check for require statements
    if (aiCode.includes("require(") || aiCode.includes("require.")) {
      console.warn("⚠️ Detected require() statement, attempting removal...");
      aiCode = aiCode.replace(/const\s+\w+\s*=\s*require\([^)]+\);?/g, "");
      aiCode = aiCode.replace(/require\([^)]+\)/g, "{}");
    }

    // 🧩 Step 2: Validate structure
    const hasComponent = /const\s+\w+Component\s*=/.test(aiCode);
    const hasRender = /render\s*\(/.test(aiCode);

    if (!hasComponent || !hasRender) {
      console.warn("⚠️ Invalid TSX detected, triggering self-repair...");

      const repairPrompt = `
  The previous output was INVALID. It must follow this EXACT structure with NO import or require() statements:

const LessonComponent = () => {
  const [value, setValue] = useState(0);
  // component code here - ONLY use browser-native APIs
  // useState, useEffect are available automatically - DO NOT import them!
  return (
    <div className="p-8 bg-gray-900 text-white rounded-xl">
      <h1>Content here</h1>
    </div>
  );
};

render(<LessonComponent />);

Topic: ${outline}

CRITICAL: 
- NO import statements
- NO require() statements
- NO markdown code blocks 
- Component MUST be named LessonComponent
- Use ONLY browser JavaScript (Math, Array, Date, etc.)
- Generate ONLY valid React/TypeScript code
- NO markdown
- NO explanations
`;

      aiCode = await generateLesson(outline, repairPrompt);
      console.log("🔧 Repair attempt output:\n", aiCode);
      
      aiCode = sanitizeTSX(aiCode);
      
      // Remove any remaining require statements
      if (aiCode.includes("require(")) {
        aiCode = aiCode.replace(/const\s+\w+\s*=\s*require\([^)]+\);?/g, "");
        aiCode = aiCode.replace(/require\([^)]+\)/g, "{}");
      }
      
      console.log("🧹 After repair sanitization:\n", aiCode);
    }

    // 🧩 Step 3: Final validation
    if (!aiCode || aiCode.length < 100 || !aiCode.includes("return")) {
      throw new Error("Generated code is too short or missing return statement");
    }

    // Final check for require()
    if (aiCode.includes("require(")) {
      throw new Error("Generated code contains require() statements which are not supported in browser");
    }

    // 🧩 Step 4: Save valid TSX
    const { error } = await supabase
      .from("lessons")
      .update({
        status: "generated",
        ts_code: aiCode,
        compile_status: "success",
        compile_error: null,
      })
      .eq("id", lessonId);

    if (error) throw new Error("Supabase update failed: " + error.message);

    console.log("✅ Lesson generated successfully with valid TSX.");
    return NextResponse.json({ success: true });
    
  } catch (err: any) {
    console.error("❌ Generation failed:", err.message);

    await supabase
      .from("lessons")
      .update({
        status: "error",
        compile_status: "failed",
        compile_error: err.message,
      })
      .eq("id", lessonId);

    return NextResponse.json({ success: false, error: err.message });
  }
}

// 🔧 Helper Functions
async function generateLesson(outline: string, prompt: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: `Create a React lesson about: "${outline}"` },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0].message?.content?.trim() || "";
}

function sanitizeTSX(raw: string): string {
  if (!raw) return "";

  let cleaned = raw.replace(/\r\n/g, "\n").trim();

  // Step 1: Remove markdown code fences
  cleaned = cleaned.replace(/```[a-z]*\n?/gi, "");
  
  // Step 2: Remove markdown formatting (but keep * for multiplication!)
  cleaned = cleaned.replace(/^#+\s+.*$/gm, ""); // headings
  cleaned = cleaned.replace(/^>\s+.*$/gm, "");  // blockquotes
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1"); // bold
  cleaned = cleaned.replace(/\b_([^_]+)_\b/g, "$1"); // italic
  cleaned = cleaned.replace(/~~([^~]+)~~/g, "$1"); // strikethrough
  
  // Step 3: Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // Step 4: Remove any require() statements (safety check)
  cleaned = cleaned.replace(/const\s+\w+\s*=\s*require\([^)]+\);?\n?/g, "");
  cleaned = cleaned.replace(/require\([^)]+\)/g, "{}");

  cleaned = cleaned.trim();

  // Step 5: Find start of actual code
  const importMatch = cleaned.match(/import\s+React/i);
  const constMatch = cleaned.match(/const\s+LessonComponent/);
  const functionMatch = cleaned.match(/function\s+LessonComponent/);
  
  let startIndex = 0;
  if (importMatch) {
    startIndex = cleaned.indexOf(importMatch[0]);
  } else if (constMatch) {
    startIndex = cleaned.indexOf(constMatch[0]);
  } else if (functionMatch) {
    startIndex = cleaned.indexOf(functionMatch[0]);
  }

  // Step 6: Find end - look for complete render() statement
  const renderMatch = cleaned.match(/render\s*\(\s*<\s*LessonComponent\s*\/?\s*>\s*\)\s*;?/i);
  let endIndex = cleaned.length;
  
  if (renderMatch) {
    const renderStart = cleaned.indexOf(renderMatch[0]);
    endIndex = renderStart + renderMatch[0].length;
  } else {
    // Fallback: Try to find the last }; which should be end of component
    const lastBraceMatch = cleaned.match(/}\s*;[\s\S]*$/);
    if (lastBraceMatch) {
      const lastBraceIndex = cleaned.lastIndexOf(lastBraceMatch[0]);
      endIndex = lastBraceIndex + 2;
      cleaned = cleaned.slice(0, endIndex) + "\n\nrender(<LessonComponent />);";
      endIndex = cleaned.length;
    }
  }

  // Step 7: Extract clean code
  cleaned = cleaned.slice(startIndex, endIndex).trim();

  // Step 8: Ensure proper ending
  if (!cleaned.endsWith(";")) {
    cleaned += ";";
  }

  // Step 9: Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Step 10: Final safety check - ensure render() exists
  if (!cleaned.includes("render(")) {
    const lastBrace = cleaned.lastIndexOf("};");
    if (lastBrace !== -1) {
      cleaned = cleaned.slice(0, lastBrace + 2) + "\n\nrender(<LessonComponent />);";
    } else {
      cleaned += "\n\nrender(<LessonComponent />);";
    }
  }

  return cleaned;
}