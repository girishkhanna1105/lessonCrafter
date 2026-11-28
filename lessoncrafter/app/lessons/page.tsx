"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Star, 
  Plus, 
  Sliders, 
  Search,
  Layers,
  Atom,
  BrainCircuit,
  Sigma,
  Dna
} from "lucide-react";

const DOMAIN_FILTERS = [
  { id: "all", label: "ALL LABS", icon: Layers },
  { id: "physics", label: "PHYSICS", icon: Atom },
  { id: "ai", label: "AI & ML", icon: BrainCircuit },
  { id: "calculus", label: "CALCULUS", icon: Sigma },
  { id: "genetics", label: "GENOMICS", icon: Dna },
];

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"global" | "personal">("global");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        setActiveTab("personal");
      } catch {}
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

      if (!error && data && data.length > 0) {
        setLessons(data);
      } else {
        if (error) {
          console.warn("[Lessons] Supabase query notice:", error);
        }
        // Graceful fallback: retrieve locally generated lessons from localStorage
        const localLessons: any[] = [];
        if (typeof window !== "undefined") {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("lesson_")) {
              const val = localStorage.getItem(key);
              if (val) {
                try {
                  const parsed = JSON.parse(val);
                  localLessons.push({
                    id: parsed.id,
                    title: parsed.title || parsed.outline || "Interactive Lesson",
                    topic: parsed.outline,
                    outline: parsed.outline,
                    status: "generated",
                    created_at: new Date().toISOString(),
                    is_public: true
                  });
                } catch {
                  // ignore non-json
                }
              }
            }
          }
        }
        if (localLessons.length > 0) {
          setLessons(localLessons);
        } else if (data) {
          setLessons(data);
        }
      }
    } catch (err) {
      console.warn("Fetch lessons failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const filteredLessons = lessons.filter((lesson) => {
    const text = `${lesson.title || ""} ${lesson.outline || ""}`.toLowerCase();
    const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.toLowerCase());
    
    if (selectedDomain === "all") return matchesSearch;
    if (selectedDomain === "physics") return matchesSearch && (text.includes("quantum") || text.includes("gravity") || text.includes("physics") || text.includes("bell") || text.includes("wave"));
    if (selectedDomain === "ai") return matchesSearch && (text.includes("transformer") || text.includes("neural") || text.includes("attention") || text.includes("model") || text.includes("learning"));
    if (selectedDomain === "calculus") return matchesSearch && (text.includes("calculus") || text.includes("matrix") || text.includes("optimization") || text.includes("hessian") || text.includes("derivative"));
    if (selectedDomain === "genetics") return matchesSearch && (text.includes("crispr") || text.includes("cas9") || text.includes("dna") || text.includes("gene") || text.includes("cell"));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background relative selection:bg-cobalt-500/20 selection:text-cobalt-800 dark:selection:text-cobalt-200 transition-colors duration-200 overflow-x-hidden">
      
      {/* ── Global Technical Blueprint Grid (Unified Atmosphere) ── */}
      <div className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden">
        
        {/* Primary 44px Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-[0.09] dark:opacity-[0.16]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2563eb 1px, transparent 1px),
              linear-gradient(to bottom, #2563eb 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px"
          }}
        />

        {/* Fine 11px Micro-Grid */}
        <div 
          className="absolute inset-0 opacity-[0.045] dark:opacity-[0.08]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: "11px 11px"
          }}
        />

        {/* Animated Laser Horizon Beam */}
        <div 
          className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cobalt-400/40 to-transparent blur-[0.5px] top-[14%] animate-pulse pointer-events-none"
        />

        {/* Ambient Top Cobalt Core Luster */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-cobalt-600/[0.12] dark:bg-cobalt-500/[0.18] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12] rounded-full blur-[160px] pointer-events-none" />

        {/* Architectural Flank Rulers */}
        <div className="hidden 2xl:flex absolute left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] rotate-180 text-cobalt-500/80 font-bold">
            AXIS_Y : 0.00 → 1.00
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-cobalt-500/40 via-slate-700/40 to-transparent" />
          <span>[ψ] READY</span>
        </div>

        <div className="hidden 2xl:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col items-center gap-6 font-mono text-[10px] text-slate-400 dark:text-slate-600 select-none">
          <span className="tracking-widest uppercase [writing-mode:vertical-lr] text-cyan-500/80 font-bold">
            CATALOG : 60FPS
          </span>
          <div className="w-px h-24 bg-gradient-to-b from-cyan-500/40 via-slate-700/40 to-transparent" />
          <span>[TeX] READY</span>
        </div>
      </div>

      <div className="relative z-10">
        <Navbar />

        {/* Toast Notification */}
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 transform ${showAuthToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"}`}>
          <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl flex items-center gap-2.5 border border-slate-200 dark:border-white/[0.1] shadow-xl backdrop-blur-md">
            <Star className="w-3.5 h-3.5 text-solar-500 fill-solar-500" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Please sign in to save and manage your laboratories.
            </p>
          </div>
        </div>

        <main className="pt-4 sm:pt-6 pb-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          
          {/* ── Compact Workspace Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-white/75 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/[0.08] font-mono text-[10px] tracking-wider text-slate-600 dark:text-slate-300 shadow-xs mb-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-cobalt-600 dark:text-cobalt-400">LAB REPOSITORY : ACTIVE</span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span className="text-cyan-500 font-bold">{lessons.length} MODULES READY</span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Parametric Lab <span className="text-cobalt-600 dark:text-cobalt-400 underline decoration-cobalt-500/30 decoration-2 underline-offset-4">Repository.</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5 max-w-xl leading-relaxed">
                Browse peer-reviewed STEM laboratories featuring real-time 60 FPS visualizers, step-by-step mathematical proofs, and Socratic challenges.
              </p>
            </div>

            <button 
              onClick={handleCreateClick}
              className="px-4 py-2 bg-cobalt-600 hover:bg-cobalt-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-cobalt-600/25 active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch Studio Lab</span>
            </button>
          </div>

          {/* ── Control Dock: Tab Switcher & Quick Search ── */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs mb-4 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            
            {/* Tab Switcher */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold">
              <button
                onClick={() => setActiveTab("global")}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === "global" 
                    ? "bg-cobalt-600 text-white shadow-xs" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Community Laboratories
              </button>
              {user && (
                <button
                  onClick={() => setActiveTab("personal")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    activeTab === "personal" 
                      ? "bg-cobalt-600 text-white shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  My Workspace Labs
                </button>
              )}
            </div>

            {/* Live Filter Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by theorem, formula, or keyword..."
                className="w-full bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-white/[0.08] rounded-md pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cobalt-500 font-sans"
              />
            </div>

          </div>

          {/* ── Domain Filter Chips ── */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 no-scrollbar">
            {DOMAIN_FILTERS.map((domain) => {
              const Icon = domain.icon;
              const isSelected = selectedDomain === domain.id;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomain(domain.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-cobalt-600 text-white border-cobalt-500 shadow-xs"
                      : "bg-white/60 dark:bg-[#0c111c]/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{domain.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Lessons Grid ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 rounded-xl p-4 animate-pulse bg-white/60 dark:bg-[#0c111c]/60 border border-slate-200/70 dark:border-white/[0.06]" />
              ))}
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="p-8 sm:p-12 text-center rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] backdrop-blur-xl shadow-xs">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery ? "No matching laboratories found" : "No laboratories found yet"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 mb-4 max-w-md mx-auto">
                {searchQuery 
                  ? `No laboratories match your query "${searchQuery}". Clear your search or compile a new laboratory.`
                  : activeTab === "global" 
                  ? "Be the first to synthesize an interactive simulation with first-principles proofs!" 
                  : "You haven't compiled any laboratories yet. Synthesize your first one below."}
              </p>
              <button 
                onClick={handleCreateClick}
                className="px-4 py-2 bg-cobalt-600 hover:bg-cobalt-500 text-white rounded-lg font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Compile Laboratory in Studio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  onClick={() => router.push(`/lessons/${lesson.id}`)}
                  className="p-4 rounded-xl bg-white/75 dark:bg-[#0c111c]/75 border border-slate-200/80 dark:border-white/[0.08] hover:border-cobalt-500/50 hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between backdrop-blur-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cobalt-500/10 text-cobalt-600 dark:text-cyan-400">
                          PARAMETRIC LAB
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-slate-400">
                        <Sliders className="w-3 h-3 text-cyan-500" />
                        <span>60 FPS SIM</span>
                      </div>
                    </div>
                    
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1 leading-snug">
                      {lesson.title}
                    </h3>
                    
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed font-sans">
                      {lesson.outline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(lesson.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-cobalt-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      <span>Launch Laboratory</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
