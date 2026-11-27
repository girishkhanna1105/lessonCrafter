import React from "react";
import { LiveProvider, LivePreview, LiveContext } from "react-live";
import { useTheme } from "next-themes";
import LessonErrorBoundary from "./LessonErrorBoundary";
import * as LucideIcons from "lucide-react";

interface LessonRunnerProps {
  code: string;
  onRuntimeError?: (error: Error) => void;
  onAutoFix?: () => void;
  onRebuild?: () => void;
  isBusy?: boolean;
}

function LiveErrorMonitor({
  onError,
  onAutoFix,
  onRebuild,
  isBusy,
}: {
  onError?: (error: Error) => void;
  onAutoFix?: () => void;
  onRebuild?: () => void;
  isBusy?: boolean;
}) {
  const { error } = React.useContext(LiveContext);

  React.useEffect(() => {
    if (error && onError) {
      onError(new Error(error));
    }
  }, [error, onError]);

  if (!error) return null;

  return (
    <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md p-4 sm:p-5 text-left shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-500/20">
        <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs uppercase tracking-wider">
          <LucideIcons.AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Simulation Syntax / Transform Notice</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400">AST COMPILER</span>
      </div>

      <p className="text-slate-300 text-xs mb-3 font-sans">
        A syntax discrepancy or incomplete code fragment was detected in this laboratory:
      </p>

      <pre className="text-rose-400 bg-black/60 rounded-lg p-3 text-xs whitespace-pre-wrap font-mono mb-4 border border-rose-500/25 overflow-x-auto shadow-inner">
        {error}
      </pre>

      <div className="flex items-center gap-2.5 flex-wrap">
        {onAutoFix && (
          <button
            type="button"
            onClick={onAutoFix}
            disabled={isBusy}
            className="px-3.5 py-2 bg-amber-500 text-slate-950 rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <LucideIcons.Wrench className="w-3.5 h-3.5" />
            <span>Auto-Fix Issue with AI</span>
          </button>
        )}

        {onRebuild && (
          <button
            type="button"
            onClick={onRebuild}
            disabled={isBusy}
            className="px-3.5 py-2 bg-cobalt-600 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-cobalt-500 transition-all shadow-md shadow-cobalt-600/25 cursor-pointer disabled:opacity-50"
          >
            <LucideIcons.RotateCcw className="w-3.5 h-3.5" />
            <span>Rebuild Laboratory</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function LessonRunner({
  code,
  onRuntimeError,
  onAutoFix,
  onRebuild,
  isBusy,
}: LessonRunnerProps) {
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
    ReactDOM: {
      render: () => {},
      createRoot: () => ({ render: () => {} }),
    },
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

  // Pre-clean code before passing to react-live
  const cleanedCode = React.useMemo(() => {
    let c = (code || "").trim();
    // Strip markdown code fences if any remain
    c = c.replace(/^```[a-z]*\s*/i, "").replace(/```\s*$/i, "").trim();
    // Normalize any ReactDOM.render variations into react-live's native render()
    c = c.replace(/ReactDOM\.render\s*\(\s*<LessonComponent\s*\/?>[^)]*\);?/gi, "render(<LessonComponent />);");
    c = c.replace(/ReactDOM\.createRoot\([^)]+\)\.render\s*\(\s*<LessonComponent\s*\/?>\s*\);?/gi, "render(<LessonComponent />);");
    
    // Safety check for truncated trailing lines (e.g. unfinished tag before render)
    if (!c.includes("render(")) {
      const lines = c.split("\n");
      while (lines.length > 0 && !lines[lines.length - 1].trim().endsWith(">") && !lines[lines.length - 1].trim().endsWith("}") && !lines[lines.length - 1].trim().endsWith(";")) {
        lines.pop();
      }
      let sanitized = lines.join("\n");
      if (!sanitized.includes("</div>\n  );")) {
        sanitized += "\n    </div>\n  );\n}";
      } else if (!sanitized.trim().endsWith("}")) {
        sanitized += "\n}";
      }
      c = sanitized + "\nrender(<LessonComponent />);";
    }
    return c;
  }, [code]);

  return (
    <div className="w-full transition-colors duration-200">
      <LiveProvider
        code={cleanedCode}
        scope={safeScope}
        noInline={true}
      >
        {/* Compile/Syntax errors with instant Auto-Fix and Rebuild actions */}
        <LiveErrorMonitor
          onError={onRuntimeError}
          onAutoFix={onAutoFix}
          onRebuild={onRebuild}
          isBusy={isBusy}
        />
        
        {/* RUNTIME errors */}
        <LessonErrorBoundary onRuntimeError={onRuntimeError || (() => {})}>
          <LivePreview />
        </LessonErrorBoundary>
      </LiveProvider>
    </div>
  );
}