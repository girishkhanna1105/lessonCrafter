import React from "react";
import { LiveProvider, LivePreview, LiveContext } from "react-live";
import { useTheme } from "next-themes";
import LessonErrorBoundary from "./LessonErrorBoundary";
import * as LucideIcons from "lucide-react";

interface LessonRunnerProps {
  code: string;
  onAutonomousRepair?: (error: Error) => void;
  onRebuild?: () => void;
  isRepairing?: boolean;
  repairAttempts?: number;
}

function LiveErrorMonitor({
  onAutonomousRepair,
  onRebuild,
  isRepairing,
  repairAttempts = 0,
}: {
  onAutonomousRepair?: (error: Error) => void;
  onRebuild?: () => void;
  isRepairing?: boolean;
  repairAttempts?: number;
}) {
  const { error } = React.useContext(LiveContext);

  React.useEffect(() => {
    if (error && !isRepairing && repairAttempts < 2 && onAutonomousRepair) {
      onAutonomousRepair(new Error(error));
    }
  }, [error, isRepairing, repairAttempts, onAutonomousRepair]);

  if (!error) return null;

  // While autonomous repair is running or within 2 attempts: show calm, elegant calibration state
  if (isRepairing || repairAttempts < 2) {
    return (
      <div className="my-8 p-8 rounded-2xl border border-cobalt-500/20 bg-cobalt-500/5 backdrop-blur-xl text-center max-w-lg mx-auto shadow-sm">
        <LucideIcons.Loader2 className="w-8 h-8 text-cobalt-500 animate-spin mx-auto mb-3" />
        <h4 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-1">
          Calibrating Laboratory Runtime...
        </h4>
        <p className="text-[11px] text-slate-500 font-sans">
          Autonomously optimizing component AST parameters (Attempt {Math.min(repairAttempts + 1, 2)}/2)
        </p>
      </div>
    );
  }

  // After 2 failed attempts: Clean, friendly user notification with Rebuild action
  return (
    <div className="my-8 p-8 sm:p-10 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c111c]/80 backdrop-blur-xl text-center max-w-md mx-auto shadow-xl">
      <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
        <LucideIcons.AlertTriangle className="w-6 h-6 text-amber-500" />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
        Something went wrong with the system
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-sans">
        We failed to compile your lesson. Please rebuild now so we can synthesize a fresh laboratory.
      </p>
      {onRebuild && (
        <button
          type="button"
          onClick={onRebuild}
          className="w-full py-2.5 bg-cobalt-600 hover:bg-cobalt-500 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all shadow-md shadow-cobalt-600/25 cursor-pointer active:scale-95"
        >
          <LucideIcons.RotateCcw className="w-3.5 h-3.5" />
          <span>Rebuild Laboratory</span>
        </button>
      )}
    </div>
  );
}

export default function LessonRunner({
  code,
  onAutonomousRepair,
  onRebuild,
  isRepairing = false,
  repairAttempts = 0,
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
        {/* Compile/Syntax errors with autonomous background auto-repair */}
        <LiveErrorMonitor
          onAutonomousRepair={onAutonomousRepair}
          onRebuild={onRebuild}
          isRepairing={isRepairing}
          repairAttempts={repairAttempts}
        />
        
        {/* Runtime errors: automatically routed to autonomous repair */}
        <LessonErrorBoundary onRuntimeError={onAutonomousRepair || (() => {})}>
          <LivePreview />
        </LessonErrorBoundary>
      </LiveProvider>
    </div>
  );
}