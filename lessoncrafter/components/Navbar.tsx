"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut, Loader2, Sparkles, BookOpen, Compass, Plus } from "lucide-react";
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
    <nav className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/70 shadow-lg shadow-slate-200/40 dark:shadow-none flex items-center justify-between w-full max-w-5xl px-5 sm:px-6 py-3 rounded-2xl transition-all">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-cobalt-600 flex items-center justify-center shadow-md shadow-cobalt-600/25 group-hover:bg-cobalt-500 group-hover:shadow-cobalt-500/30 transition-all">
              <span className="text-white font-black text-sm tracking-tight">LC</span>
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Lesson<span className="text-cobalt-600 dark:text-cobalt-400">Crafter</span>
            </span>
          </Link>
        </div>
        
        {/* Main Navigation */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all"
          >
            Home
          </Link>
          <Link
            href="/lessons"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-slate-400" />
            Explore
          </Link>
          <Link
            href="/studio"
            className="px-3.5 py-2 rounded-xl text-cobalt-600 dark:text-cobalt-400 hover:bg-cobalt-50 dark:hover:bg-cobalt-950/50 font-semibold transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Lesson
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {loading ? (
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          ) : user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group cursor-pointer"
                title="Account Settings"
              >
                <div className="w-7 h-7 rounded-lg bg-cobalt-500/15 dark:bg-cobalt-500/20 text-cobalt-700 dark:text-cobalt-300 flex items-center justify-center font-bold text-xs border border-cobalt-400/20 dark:border-cobalt-500/30">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline max-w-[100px] truncate">
                  {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth"
                className="text-xs font-semibold px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
              <Link
                href="/studio"
                className="px-4 py-2 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs shadow-md shadow-cobalt-600/25 transition-all hover:shadow-cobalt-500/30 active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
