"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Plus, Clock, CheckCircle2, AlertCircle, Loader2, BookOpen, ChevronRight, Sparkles, Zap, Brain, Code2, Paintbrush } from "lucide-react";
import Navbar from "@/components/Navbar";

type AgentStatus = "waiting" | "running" | "done" | "error";

interface PipelineProgress {
  content: AgentStatus;
  interactive: AgentStatus;
  quiz: AgentStatus;
  compiler: AgentStatus;
  polish: AgentStatus;
}

const AGENTS = [
  { key: "content", label: "Content Architect", model: "Gemini 2.5 Pro", icon: Brain, desc: "Structuring curriculum & explanations" },
  { key: "interactive", label: "Interactive Builder", model: "Gemini Flash Lite", icon: Zap, desc: "Designing interactive elements" },
  { key: "quiz", label: "Quiz Designer", model: "Llama 3.3 70B", icon: Sparkles, desc: "Crafting quiz questions" },
  { key: "compiler", label: "Compiler / Coder", model: "Gemini 2.5 Pro", icon: Code2, desc: "Assembling the lesson component" },
  { key: "polish", label: "UI Polish", model: "Gemini Flash Lite", icon: Paintbrush, desc: "Refining visual experience" },
] as const;

export default function GeneratorPage() {
  const [outline, setOutline] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pipeline, setPipeline] = useState<PipelineProgress | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") {
      router.push("/auth");
      return;
    }
    try {
      const u = JSON.parse(storedUser);
      setUser(u);
      // Fetch their profile for AI context
      fetch(`/api/profile?userId=${u.id}&role=${u.role || 'student'}`)
        .then(r => r.json())
        .then(d => { if (d.profile) setUserProfile(d.profile); });
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
    
    const pendingPrompt = localStorage.getItem("pending_prompt");
    if (pendingPrompt) {
      setOutline(pendingPrompt);
      localStorage.removeItem("pending_prompt");
    }
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      const u = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
      let query = supabase.from("lessons").select("*");
      if (u && u.id) query = query.eq("user_id", u.id);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (!error && data) setLessons(data);
    } catch (e) {
      console.error("Fetch lessons failed:", e);
    }
  };

  const addLesson = async () => {
    if (!outline.trim()) return;
    setLoading(true);
    setPipeline({ content: "waiting", interactive: "waiting", quiz: "waiting", compiler: "waiting", polish: "waiting" });

    try {
      const response = await fetch("/api/generate-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: outline,
          userId: user?.id || null,
          userProfile,
          isPublic,
        }),
      });

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace("data: ", ""));

            if (json.type === "progress") {
              setPipeline({ ...json.progress });
            } else if (json.type === "done") {
              setLoading(false);
              setPipeline(null);
              router.push(`/lessons/${json.lessonId}`);
              return;
            } else if (json.type === "error") {
              console.error("Pipeline error:", json.message);
              setLoading(false);
              setPipeline(null);
              alert("Generation failed: " + json.message);
              return;
            }
          } catch (_) {}
        }
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setLoading(false);
      setPipeline(null);
      alert("Error: " + err.message);
    }
  };

  const getStatusColor = (s: AgentStatus) => {
    if (s === "done") return "#22c55e";
    if (s === "running") return "#6366f1";
    if (s === "error") return "#ef4444";
    return "#374151";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 h-[calc(100vh-2rem)]">
        
        {/* --- LEFT SIDEBAR (History) --- */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              History
            </h2>
            <span className="text-xs font-medium px-2 py-1 glass rounded-lg text-gray-400">
              {lessons.length} Lessons
            </span>
          </div>

          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 relative">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {lessons.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-6 text-gray-500 italic text-sm">
                  No lessons generated yet.
                </div>
              ) : (
                lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => lesson.status === "generated" && router.push(`/lessons/${lesson.id}`)}
                    className={`w-full text-left p-3 rounded-xl border border-transparent transition-all group ${
                      lesson.status === "generated" 
                        ? "hover:bg-white/5 hover:border-white/10" 
                        : "opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-gray-200 group-hover:text-white transition-colors">
                          {lesson.title}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-bold">
                          {new Date(lesson.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-0.5">
                        {lesson.status === "generated" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {lesson.status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
                        {lesson.status === "generating" && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 bg-white/5">
              <p className="text-[10px] text-center text-gray-500 uppercase tracking-[0.2em] font-bold">
                Multi-Agent v2 Pipeline
              </p>
            </div>
          </div>
        </aside>

        {/* --- MAIN GENERATOR AREA --- */}
        <section className="flex-1 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">New Lesson Draft</h1>
              <p className="text-sm text-gray-400">
                {userProfile ? `Personalized for your ${user?.role || 'student'} profile` : 'Describe what you want to learn today.'}
              </p>
            </div>
          </div>

          {/* Agent Pipeline Progress — shows only when generating */}
          {loading && pipeline && (
            <div className="glass-card p-6 border-indigo-500/20 animate-in fade-in duration-500">
              <p className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Multi-Agent Pipeline Running
              </p>
              <div className="flex flex-col gap-3">
                {AGENTS.map((agent, i) => {
                  const status = pipeline[agent.key];
                  const Icon = agent.icon;
                  return (
                    <div key={agent.key} className="flex items-center gap-4">
                      {/* Status bar segment */}
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500"
                          style={{ background: `${getStatusColor(status)}18`, border: `1px solid ${getStatusColor(status)}40` }}
                        >
                          {status === "running" ? (
                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: getStatusColor(status) }} />
                          ) : status === "done" ? (
                            <CheckCircle2 className="w-4 h-4" style={{ color: getStatusColor(status) }} />
                          ) : status === "error" ? (
                            <AlertCircle className="w-4 h-4" style={{ color: getStatusColor(status) }} />
                          ) : (
                            <Icon className="w-4 h-4" style={{ color: getStatusColor(status) }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white">{agent.label}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getStatusColor(status) }}>
                              {status === "waiting" ? "Waiting" : status === "running" ? "Running..." : status === "done" ? "Done ✓" : "Error"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-0.5">{agent.desc} · {agent.model}</p>
                          {/* Progress bar */}
                          <div className="mt-2 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{
                                width: status === "done" ? "100%" : status === "running" ? "65%" : "0%",
                                background: getStatusColor(status),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && (
            <div className="flex-1 glass-card flex flex-col p-8">
              <div className="mb-6 flex-1 flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  Lesson Outline & Goals
                </label>
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder='e.g. "Create a beginner-friendly lesson on React Server Components. Cover the basics of hydration and data fetching."'
                  className="flex-1 w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-lg text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <BookOpen className="w-3.5 h-3.5" />
                    5-Agent AI Pipeline Active
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer group ml-1 mt-1">
                    <div className={`w-10 h-5 rounded-full transition-all relative ${isPublic ? 'bg-indigo-600' : 'bg-gray-800'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isPublic} 
                        onChange={() => setIsPublic(!isPublic)}
                      />
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPublic ? 'left-6' : 'left-1'}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                      {isPublic ? 'Public Artifact' : 'Private Insight'}
                    </span>
                  </label>
                </div>
                
                <button
                  onClick={addLesson}
                  disabled={loading || !outline.trim()}
                  className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 shadow-2xl ${
                    loading || !outline.trim()
                      ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/10"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 active:scale-95"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  Launch Agents
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-card p-6 flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              <p className="text-sm text-gray-400 font-medium">
                Agents are working in parallel — this takes 30-90 seconds for best results
              </p>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}