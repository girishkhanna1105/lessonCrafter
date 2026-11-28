"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Loader2, Compass, Plus, Terminal, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 sm:h-16 bg-white/80 dark:bg-[#0c111c]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/[0.08] select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        
        {/* Left: Brand Identity & Subsystem Badge */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cobalt-600/10 dark:bg-cobalt-500/15 border border-cobalt-500/30 flex items-center justify-center text-cobalt-600 dark:text-cobalt-400 group-hover:bg-cobalt-600 group-hover:text-white transition-all shadow-sm">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Lesson<span className="text-cobalt-600 dark:text-cobalt-400">Crafter</span>
              </span>
              <span className="hidden md:inline font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                WORKBENCH
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 dark:border-white/[0.08] text-xs font-medium">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/lessons"
              className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Explore Labs</span>
            </Link>
            <Link
              href="/studio"
              className="px-3 py-1.5 rounded-md text-cobalt-600 dark:text-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-950/40 font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Lesson</span>
            </Link>
          </nav>
        </div>

        {/* Right Section: Telemetry, Theme & Session Control */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Real-Time Engine Telemetry Chip */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] font-mono text-[11px] text-slate-500 dark:text-slate-400 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYS:READY</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-cobalt-600 dark:text-cobalt-400 font-semibold">28ms</span>
          </div>

          <ThemeToggle />

          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] border border-transparent hover:border-slate-200 dark:hover:border-white/[0.06] transition-all group cursor-pointer"
                title="Account Settings"
              >
                <div className="w-6 h-6 rounded-md bg-cobalt-600/10 dark:bg-cobalt-500/15 text-cobalt-600 dark:text-cobalt-300 flex items-center justify-center font-bold text-xs border border-cobalt-500/20">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="text-xs font-medium px-2.5 py-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/studio"
                className="px-3.5 py-1.5 rounded-lg bg-cobalt-600 hover:bg-cobalt-500 active:scale-[0.98] text-white font-semibold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch Studio</span>
                <ArrowRight className="w-3 h-3 opacity-80" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
