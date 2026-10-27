import React from "react";
import { LiveProvider, LiveError, LivePreview } from "react-live";
import { useTheme } from "next-themes";
import LessonErrorBoundary from "./LessonErrorBoundary";
import * as LucideIcons from "lucide-react";

interface LessonRunnerProps {
  code: string;
  onRuntimeError: (error: Error) => void;
}

export default function LessonRunner({ code, onRuntimeError }: LessonRunnerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light"; // default to dark if undefined or dark

  // Safety check for require()
  if (code.includes("require(")) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/50 rounded-xl text-red-300">
        <h3 className="text-xl font-bold mb-2">⚠️ Invalid Code Detected</h3>
        <p className="text-sm mb-4">
          This lesson contains <code>require()</code> statements which are not supported.
        </p>
      </div>
    );
  }

  // Dynamic LucideIcon component helper in case generated code uses <LucideIcon name="CheckCircle2" ... />
  const LucideIcon = ({ name, ...props }: { name?: string; [key: string]: any }) => {
    const Component = (name && (LucideIcons as any)[name]) || (LucideIcons as any).Sparkles || LucideIcons.HelpCircle;
    return <Component {...props} />;
  };

  const baseScope: Record<string, any> = {
    // All Lucide icons (Target, Award, BookOpen, CheckCircle2, Sliders, Brain, Atom, etc.)
    ...LucideIcons,
    LucideIcon,
    // React core & hooks
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    useContext: React.useContext,
    useReducer: React.useReducer,
    // Dual-mode theme tokens & interactive controls
    isDark,
    isDarkMode: isDark,
    themeMode: isDark ? "dark" : "light",
    setTheme,
    toggleTheme: () => setTheme(isDark ? "light" : "dark"),
    onThemeChange: (newDark: boolean) => setTheme(newDark ? "dark" : "light"),
    theme: {
      isDark,
      bg: isDark ? "#0a0f18" : "#f8fafc",
      card: isDark ? "#111827" : "#ffffff",
      cardAlt: isDark ? "#161f30" : "#f1f5f9",
      border: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
      text: isDark ? "#f8fafc" : "#0f172a",
      textMuted: isDark ? "#94a3b8" : "#64748b",
      cobalt: "#2563eb",
      electricCobalt: "#3b82f6",
      marine: "#06b6d4",
      solar: "#f59e0b",
      emerald: "#10b981",
      danger: "#ef4444",
    },
  };

  // Standard built-in JS constructor names that must not be intercepted as JSX components
  const standardGlobals = new Set([
    "Array", "Object", "Function", "Boolean", "Number", "String", "Symbol",
    "Date", "Promise", "RegExp", "Error", "EvalError", "RangeError", "ReferenceError",
    "SyntaxError", "TypeError", "URIError", "JSON", "Math", "Intl", "Map", "Set",
    "WeakMap", "WeakSet", "ArrayBuffer", "DataView", "Uint8Array", "Int8Array",
    "Uint16Array", "Int16Array", "Uint32Array", "Int32Array", "Float32Array", "Float64Array",
    "BigInt", "BigInt64Array", "BigUint64Array", "Proxy", "Reflect"
  ]);

  // Safe Scope Proxy: Prevents ANY ReferenceError if an AI hallucinated an unknown icon/component name
  const safeScope = new Proxy(baseScope, {
    has(target, prop) {
      if (typeof prop === "string" && /^[A-Z]/.test(prop) && !standardGlobals.has(prop)) {
        return true;
      }
      return prop in target;
    },
    get(target, prop) {
      if (typeof prop === "string" && prop in target) {
        return target[prop];
      }
      if (typeof prop === "string" && /^[A-Z]/.test(prop) && !standardGlobals.has(prop)) {
        // Fallback component for any unknown component so it never crashes the lesson
        return function FallbackIcon(props: any) {
          const Fallback = (LucideIcons as any).Sparkles || (() => null);
          return <Fallback {...props} />;
        };
      }
      return undefined;
    },
  });

  return (
    <div className="w-full transition-colors duration-200">
      <LiveProvider
        code={code}
        scope={safeScope}
        noInline={true}
      >
        {/* COMPILE errors */}
        <LiveError className="text-red-400 bg-red-950/30 rounded-md p-3 text-sm whitespace-pre-wrap font-mono mb-4 border border-red-500/20" />
        
        {/* RUNTIME errors */}
        <LessonErrorBoundary onRuntimeError={onRuntimeError}>
          <LivePreview />
        </LessonErrorBoundary>
      </LiveProvider>
    </div>
  );
}