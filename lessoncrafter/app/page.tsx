"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AuthenticatedHero from "@/components/AuthenticatedHero";
import HeroSection from "@/components/HeroSection";
import LowerSection from "@/components/LowerSection";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-transparent selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200">
      <Navbar />
      
      {!loading && (
        user ? <AuthenticatedHero user={user} /> : <HeroSection />
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
        <LowerSection />
      </div>
      
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-xs font-mono font-bold uppercase tracking-[0.2em]">
          LessonCrafter © {new Date().getFullYear()} — Precision AI Educational Platform
        </p>
      </footer>
    </div>
  );
}