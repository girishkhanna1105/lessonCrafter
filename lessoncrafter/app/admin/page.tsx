"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { 
  Cpu, 
  RotateCcw, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Activity, 
  Loader2 
} from "lucide-react";

interface AdminMetrics {
  total: number;
  ready: number;
  failed: number;
  generating: number;
  successRate: number;
}

interface LessonItem {
  id: string;
  title: string | null;
  outline: string;
  status: string;
  compile_error: string | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setLessons(data.lessons);
      }
    } catch (err: any) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleResetStuck = async () => {
    setActing(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_stuck" }),
      });
      const data = await res.json();
      if (data.success) {
        setNotice("All in-flight stuck tasks have been marked as timed out.");
        fetchMetrics();
        setTimeout(() => setNotice(null), 4000);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActing(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this lesson?")) return;
    setActing(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", lessonId: id }),
      });
      const data = await res.json();
      if (data.success) {
        setLessons((prev) => prev.filter((l) => l.id !== id));
        setNotice("Lesson deleted.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-28 pb-20">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-cobalt-600 dark:text-cobalt-400">
                Mission Control • Operations Center
              </p>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              System Telemetry & Moderation
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetStuck}
              disabled={acting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-solar-500/40 text-solar-600 dark:text-solar-400 hover:bg-solar-500/10 text-xs font-mono font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Stuck Generations
            </button>

            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-md shadow-cobalt-600/20 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
              Refresh Data
            </button>
          </div>
        </div>

        {/* Notice alert */}
        {notice && (
          <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Total Lessons</span>
              <div className="w-8 h-8 rounded-lg bg-cobalt-500/10 text-cobalt-600 dark:text-cobalt-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? metrics.total : "—"}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 font-mono">Synthesized artifacts</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Success Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? `${metrics.successRate}%` : "—"}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 font-mono">{metrics ? metrics.ready : 0} compiled cleanly</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Active Workers</span>
              <div className="w-8 h-8 rounded-lg bg-marine-500/10 text-marine-600 dark:text-marine-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? metrics.generating : "—"}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 font-mono">Parallel Agent jobs</p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">Build Failures</span>
              <div className="w-8 h-8 rounded-lg bg-solar-500/10 text-solar-600 dark:text-solar-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {metrics ? metrics.failed : "—"}
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-500 mt-2 font-mono">Requires auto-patch</p>
          </div>
        </div>

        {/* Engine Status Grid */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-white/10 mb-10">
          <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-gray-400 mb-4">
            AI Provider Topology & Cluster Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Groq Reasoning Cluster</div>
                <div className="text-xs text-slate-500 font-mono">openai/gpt-oss-120b</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Google Gemini Neural API</div>
                <div className="text-xs text-slate-500 font-mono">gemini-1.5-flash / gemini-2.0</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Supabase PostgreSQL DB</div>
                <div className="text-xs text-slate-500 font-mono">Realtime RLS Protected</div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Recent Lessons Moderation Table */}
        <div className="glass-card rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Recent Lesson Manifest</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">Inspect live builds, diagnose compilation errors, or moderate artifacts.</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">
              Showing {lessons.length} artifacts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 dark:bg-slate-900/80 text-slate-500 dark:text-gray-400 font-mono font-bold uppercase tracking-wider border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="py-3.5 px-6">Topic / Title</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Diagnostics</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {lesson.title || lesson.outline}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 dark:text-gray-500 truncate max-w-xs">
                        ID: {lesson.id}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[10px] uppercase tracking-wider ${
                        lesson.status === "generated"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : lesson.status === "generating"
                          ? "bg-solar-500/10 text-solar-600 dark:text-solar-400 border border-solar-500/30"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                      }`}>
                        {lesson.status === "generated" && "● Ready"}
                        {lesson.status === "generating" && "◌ In Progress"}
                        {lesson.status === "failed" && "▲ Failed"}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {lesson.compile_error ? (
                        <span className="font-mono text-[10px] text-red-500 dark:text-red-400 truncate block max-w-xs" title={lesson.compile_error}>
                          {lesson.compile_error.slice(0, 45)}...
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[10px]">Clean AST</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 dark:text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString() : "—"}
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/lessons/${lesson.id}`)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cobalt-500 text-slate-600 dark:text-slate-300 hover:text-cobalt-600 dark:hover:text-cobalt-400 transition-colors"
                          title="Open in Viewer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={acting}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-red-500 text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-gray-500 font-mono">
                      No lessons found in database archive.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
