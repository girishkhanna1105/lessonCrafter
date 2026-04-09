"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { BookMarked, ArrowRight, Clock, Star } from "lucide-react";

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
      // Auto-redirect after some time to allow them to read the toast
      setTimeout(() => router.push('/auth'), 2500);
    } else {
      router.push('/page2');
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
      console.error("Fetch component failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [activeTab, user]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Navbar />
      
      {/* Custom UI Toast */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 transform ${showAuthToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="glass px-8 py-4 rounded-2xl flex items-center gap-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Authentication Required</h4>
            <p className="text-gray-400 text-xs">Please sign in to start crafting your own lessons.</p>
          </div>
        </div>
      </div>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                {activeTab === 'global' ? 'Global Commons' : 'Personal Library'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6">
              {activeTab === 'global' ? 'Lesson' : 'My'}{" "}
              <span className="text-gradient">Archive</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              {activeTab === 'global' 
                ? "Browse through public AI-crafted lessons shared by the community."
                : "Manage and revisit your personal AI-generated educational insights."
              }
            </p>
          </div>
          
          <button 
            onClick={handleCreateClick}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            Create New
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-4 mb-12 border-b border-white/5 pb-6">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'global' 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Public Commons
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'personal' 
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" 
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              My Lessons
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-64 p-8 animate-pulse bg-white/5" />
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <div className="glass-card p-20 text-center">
            <h2 className="text-2xl font-bold mb-4">No Lessons Found</h2>
            <p className="text-gray-400 mb-8">
              {activeTab === 'global' 
                ? "Be the first to share a public lesson!" 
                : "You haven't saved any private lessons yet."}
            </p>
            <button 
              onClick={handleCreateClick}
              className="px-6 py-3 glass rounded-xl text-white font-bold"
            >
              Start Generating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {lessons.map((lesson) => (
              <div 
                key={lesson.id} 
                onClick={() => router.push(`/lessons/${lesson.id}`)}
                className="glass-card p-8 group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
                    <BookMarked className="w-6 h-6 text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  {!lesson.is_public && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <Star className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Private</span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-black mb-3 text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                
                <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed">
                  {lesson.outline}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-[10px] uppercase font-black text-gray-500 tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(lesson.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-20 px-6 border-t border-white/5 text-center bg-black/20">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.2em] mb-4">
          LessonCrafter // Global Knowledge Repository
        </p>
      </footer>
    </div>
  );
}
