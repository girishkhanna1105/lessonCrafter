"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookMarked, ArrowRight, Clock, Star, Plus } from "lucide-react";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'personal'>('global');
  const [user, setUser] = useState<any>(null);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      const u = JSON.parse(storedUser);
      setUser(u);
      setActiveTab('personal');
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
      setTimeout(() => router.push('/auth'), 2000);
    } else {
      router.push('/studio');
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    try {
      let query = supabase.from("lessons").select("*").eq("status", "generated");

      if (activeTab === 'personal') {
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
      
      {/* Custom UI Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showAuthToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="glass px-8 py-4 rounded-2xl flex items-center gap-4 border border-cobalt-500/30 shadow-2xl shadow-cobalt-500/20">
          <div className="w-10 h-10 rounded-xl bg-cobalt-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-cobalt-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-sm">Authentication Required</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Please sign in to start crafting your own lessons.</p>
          </div>
        </div>
      </div>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
              <BookMarked className="w-4 h-4 text-cobalt-600 dark:text-cobalt-400" />
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-cobalt-300 uppercase tracking-widest">
                {activeTab === 'global' ? 'Global Commons' : 'Personal Library'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
              {activeTab === 'global' ? 'Lesson' : 'My'}{" "}
              <span className="text-gradient">Archive</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              {activeTab === 'global' 
                ? "Browse verified interactive micro-lessons synthesized and shared by the community."
                : "Manage, review, and revisit your private AI-generated interactive lessons."
              }
            </p>
          </div>
          
          <button 
            onClick={handleCreateClick}
            className="px-6 py-3.5 bg-cobalt-600 hover:bg-cobalt-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-cobalt-600/25 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Launch Studio
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 mb-10 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'global' 
                ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/20" 
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/40"
            }`}
          >
            Public Commons
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'personal' 
                  ? "bg-cobalt-600 text-white shadow-md shadow-cobalt-600/20" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900/40"
              }`}
            >
              My Lessons
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-64 p-8 animate-pulse bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No Lessons Found</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              {activeTab === 'global' 
                ? "Be the first to synthesize and share a public interactive lesson!" 
                : "You haven't crafted any private lessons yet."}
            </p>
            <button 
              onClick={handleCreateClick}
              className="px-6 py-3 bg-cobalt-600 hover:bg-cobalt-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-cobalt-600/20"
            >
              Start Generating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                onClick={() => router.push(`/lessons/${lesson.id}`)}
                className="glass-card p-6 sm:p-7 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-10 h-10 rounded-xl bg-cobalt-500/10 flex items-center justify-center border border-cobalt-500/20 group-hover:bg-cobalt-600 transition-colors">
                      <BookMarked className="w-5 h-5 text-cobalt-600 dark:text-cobalt-400 group-hover:text-white transition-colors" />
                    </div>
                    {!lesson.is_public && (
                      <div className="flex items-center gap-1 text-solar-500 bg-solar-500/10 px-2 py-0.5 rounded-full border border-solar-500/20">
                        <Star className="w-3 h-3 fill-solar-500 text-solar-500" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Private</span>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-black mb-2 text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 line-clamp-3 leading-relaxed">
                    {lesson.outline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-cobalt-600 dark:text-cobalt-400 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5 text-center bg-slate-50 dark:bg-black/20">
        <p className="text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">
          LessonCrafter // Global Knowledge Repository
        </p>
      </footer>
    </div>
  );
}
