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
    <div className="min-h-screen bg-transparent selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200">
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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
        <LowerSection />
      </div>
    </div>
  );
}