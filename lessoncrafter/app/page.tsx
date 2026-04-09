"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen bg-transparent selection:bg-indigo-500/30 selection:text-white">
      <Navbar />
      
      {!loading && (
        user ? <AuthenticatedHero user={user} /> : <HeroSection />
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
        <LowerSection />
      </div>
      
      <footer className="py-20 px-6 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          LessonCrafter // The Future of AI-Native Education
        </p>
        <p className="text-gray-400 text-sm">
          Made with 💜 by Girish | Powered by Gemini + Supabase + Next.js
        </p>
      </footer>
    </div>
  );
}