"use client";

import React from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";

interface LessonRunnerProps {
  code: string;
}

export default function LessonRunner({ code }: LessonRunnerProps) {
  const cleanCode = extractPureTSX(code);
  console.log("🧩 Cleaned code:\n", cleanCode);

  // 🚨 Check for require() statements
  if (cleanCode.includes("require(")) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300">
        <h3 className="text-xl font-bold mb-2">⚠️ Invalid Code Detected</h3>
        <p className="text-sm mb-4">
          This lesson contains <code>require()</code> statements which are not supported in the browser.
        </p>
        <p className="text-xs text-red-400">
          Please regenerate this lesson. The AI may have used Node.js modules instead of browser-compatible code.
        </p>
      </div>
    );
  }

  // Wrap code in try-catch for better error handling
  const safeCode = `
    try {
      ${cleanCode}
    } catch (error) {
      console.error('Lesson runtime error:', error);
      render(
        <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300">
          <h3 className="text-xl font-bold mb-2">⚠️ Runtime Error</h3>
          <p className="text-sm">{error.message}</p>
          <p className="text-xs mt-2 text-red-400">Check the console for details.</p>
        </div>
      );
    }
  `;

  return (
    <div className="w-full">
      <LiveProvider 
        code={safeCode}
        scope={{ 
          React,
          useState: React.useState,
          useEffect: React.useEffect,
          useRef: React.useRef,
          useMemo: React.useMemo,
          useCallback: React.useCallback,
          useContext: React.useContext,
          useReducer: React.useReducer
        }}
        noInline={true}
      >
        {/* No wrapper - let the AI component define its own styling */}
        <LivePreview />
        <LiveError className="text-red-400 bg-red-950/30 rounded-md p-3 text-sm whitespace-pre-wrap font-mono mt-4" />
      </LiveProvider>
    </div>
  );
}

// 🧹 Improved extraction function
function extractPureTSX(raw: string): string {
  if (!raw) return "";

  let cleaned = raw.replace(/\r\n/g, "\n").trim();

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[a-z]*\n?/gi, "");
  
  // Remove markdown headings
  cleaned = cleaned.replace(/^#+\s+.*$/gm, "");
  
  // Remove markdown blockquotes
  cleaned = cleaned.replace(/^>\s+.*$/gm, "");
  
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  
  // 🚨 CRITICAL: Remove require() statements
  cleaned = cleaned.replace(/const\s+\w+\s*=\s*require\([^)]+\);?\n?/g, "");
  cleaned = cleaned.replace(/require\([^)]+\)/g, "{}");
  
  cleaned = cleaned.trim();

  // 🔧 CRITICAL FIX: Remove import statements - they don't work in react-live
  // react-live provides React through scope, not imports
  cleaned = cleaned.replace(/import\s+.*?from\s+['"]react['"];?\n?/gi, "");
  
  // Find the start of the actual code
  const constMatch = cleaned.match(/const\s+LessonComponent/);
  const functionMatch = cleaned.match(/function\s+LessonComponent/);
  
  let startIndex = 0;
  if (constMatch) {
    startIndex = cleaned.indexOf(constMatch[0]);
  } else if (functionMatch) {
    startIndex = cleaned.indexOf(functionMatch[0]);
  }

  // Find the render call
  const renderMatch = cleaned.match(/render\s*\(\s*<[\s\S]*?\/>\s*\)\s*;?/);
  let endIndex = cleaned.length;
  
  if (renderMatch) {
    endIndex = cleaned.indexOf(renderMatch[0]) + renderMatch[0].length;
  }

  // Extract the code slice
  cleaned = cleaned.slice(startIndex, endIndex).trim();

  // Remove remaining markdown artifacts (but preserve * for multiplication)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // bold
  cleaned = cleaned.replace(/\b_([^_]+)_\b/g, '$1'); // italic
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1'); // strikethrough
  
  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Ensure it ends with a semicolon
  if (!cleaned.endsWith(';') && !cleaned.endsWith('}')) {
    cleaned += ';';
  }

  return cleaned.trim();
}