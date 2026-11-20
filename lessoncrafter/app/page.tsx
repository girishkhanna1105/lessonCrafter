"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AuthenticatedHero from "@/components/AuthenticatedHero";
import HeroSection from "@/components/HeroSection";
import LowerSection from "@/components/LowerSection";

import InteractivePreviewSandbox from "@/components/InteractivePreviewSandbox";
import CurriculumExplorer from "@/components/CurriculumExplorer";
import InteractiveSocraticDemo from "@/components/InteractiveSocraticDemo";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // fallback
    }
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-background relative selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200 overflow-x-hidden">
      
      {/* ── Global Continuous Technical Blueprint Grid (Unified Across Entire Page) ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        {/* Primary 44px Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.14]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2563eb 1px, transparent 1px),
              linear-gradient(to bottom, #2563eb 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        {/* Fine 11px Micro Grid */}
        <div 
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: "11px 11px"
          }}
        />

        {/* Ambient Top Cobalt Core Luster (Hero Region) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-cobalt-600/[0.12] dark:bg-cobalt-500/[0.18] rounded-full blur-[160px] pointer-events-none" />
        
        {/* Ambient Mid-Page Cyan Depth Glow (Simulation Sandbox Region) */}
        <div className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-marine-500/[0.08] dark:bg-cyan-500/[0.13] rounded-full blur-[160px] pointer-events-none" />

        {/* Ambient Lower Page Cobalt Glow (Curriculum & Socratic Region) */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-cobalt-600/[0.08] dark:bg-cobalt-500/[0.13] rounded-full blur-[160px] pointer-events-none" />
      </div>

      <div className="relative z-10">
        <Navbar />
        
        {loading ? (
          <div className="min-h-[85vh] flex flex-col items-center justify-center pt-28 pb-16 px-4">
            <div className="max-w-4xl w-full mx-auto space-y-6">
              <div className="w-36 h-8 rounded-full skeleton" />
              <div className="w-3/4 h-16 rounded-2xl skeleton" />
              <div className="w-1/2 h-6 rounded-xl skeleton" />
              <div className="w-full h-16 rounded-2xl skeleton" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="h-20 rounded-2xl skeleton" />
                <div className="h-20 rounded-2xl skeleton" />
                <div className="h-20 rounded-2xl skeleton" />
                <div className="h-20 rounded-2xl skeleton" />
              </div>
            </div>
          </div>
        ) : user ? (
          <AuthenticatedHero user={user} />
        ) : (
          <HeroSection />
        )}

        {/* Interactive Simulation Sandbox */}
        <InteractivePreviewSandbox />

        {/* Interactive Curriculum Tracks */}
        <CurriculumExplorer />

        {/* Live Socratic Dialogue Playground */}
        <InteractiveSocraticDemo />

        <div className="relative">
          <LowerSection />
        </div>
      </div>
    </div>
  );
}