"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookOpen, ArrowRight, Clock, Star, Plus, Compass } from "lucide-react";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");
  const [user, setUser] = useState<any>(null);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      const u = JSON.parse(storedUser);
      setUser(u);
      setActiveTab("personal");
    }
  }, []);

  // Toast Timer
  useEffect(() => {
    if (showAuthToast) {
      const timer = setTimeout(() => setShowAuthToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showAuthToast]);

  const handleCreateClick = () => {
    if (!user) {
      setShowAuthToast(true);
      setTimeout(() => router.push("/auth"), 1500);
    } else {
      router.push("/studio");
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      let query = supabase.from("lessons").select("*").eq("status", "generated");

      if (activeTab === "personal") {
        if (!user) {
          setLessons([]);
          setLoading(false);
          return;
        }
        query = query.eq("user_id", user.id);
      } else {
        query = query.eq("is_public", true);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching lessons:", error);
      } else if (data) {
        setLessons(data);
      }
    } catch (err) {
      console.error("Fetch lessons failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [activeTab, user]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden transition-colors duration-200">
      <Navbar />
      
      {/* Toast Notification */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${showAuthToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
        <div className="bg-white dark:bg-slate-900 px-6 py-3.5 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-800 shadow-xl">
          <Star className="w-4 h-4 text-solar-500 fill-solar-500" />
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Please sign in to save and manage your lessons.
          </p>
        </div>
      </div>

      <main className="pt-32 pb-20 px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              <Compass className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
              <span>Lesson Library</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              Explore <span className="text-gradient">Lessons</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              Browse interactive lessons featuring real-time visualizers, step-by-step theory, and practice questions.
            </p>
          </div>
          
          <button 
            onClick={handleCreateClick}
            className="px-5 py-3 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cobalt-600/20 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Lesson</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("global")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "global" 
                ? "bg-cobalt-600 text-white shadow-sm" 
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Community Lessons
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "personal" 
                  ? "bg-cobalt-600 text-white shadow-sm" 
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              My Lessons
            </button>
          )}
        </div>

        {/* Lessons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-44 rounded-2xl p-6 animate-pulse bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No lessons found yet</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-5">
              {activeTab === "global" 
                ? "Be the first to create and share an interactive lesson!" 
                : "You haven't saved any lessons yet."}
            </p>
            <button 
              onClick={handleCreateClick}
              className="px-5 py-2.5 bg-cobalt-600 hover:bg-cobalt-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm"
            >
              Create Your First Lesson
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                onClick={() => router.push(`/lessons/${lesson.id}`)}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 hover:border-cobalt-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400">
                      Interactive Lesson
                    </span>
                    {!lesson.is_public && (
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        Private
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {lesson.outline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-cobalt-600 dark:text-cobalt-400 group-hover:translate-x-1 transition-transform">
                    <span>Open Lesson</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
