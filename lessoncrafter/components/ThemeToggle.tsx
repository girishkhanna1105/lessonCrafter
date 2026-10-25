"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-14 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex items-center h-8 w-15 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cobalt-500/40 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme mode"
    >
      {/* Sliding pill */}
      <span
        className={`absolute w-6 h-6 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center shadow-sm ${
          isDark
            ? "translate-x-7 bg-cobalt-600 text-white"
            : "translate-x-0.5 bg-white text-solar-500 border border-slate-200"
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-solar-500" />
        )}
      </span>

      {/* Background icons */}
      <span className="w-full flex justify-between items-center px-1.5 text-xs select-none pointer-events-none">
        <Sun className={`w-3.5 h-3.5 transition-opacity ${isDark ? "text-slate-500 opacity-60" : "opacity-0"}`} />
        <Moon className={`w-3.5 h-3.5 transition-opacity ${isDark ? "opacity-0" : "text-slate-400 opacity-60"}`} />
      </span>
    </button>
  );
}

export default ThemeToggle;
