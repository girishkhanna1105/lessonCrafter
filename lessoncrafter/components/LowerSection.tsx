import { Sliders, BookOpen, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: Sliders,
    accent: "cobalt",
    label: "Interactive Simulations",
    desc: "Manipulate real-time parameters with live sliders and watch equations respond visually as you change variables.",
    tag: "Hands-On",
  },
  {
    icon: BookOpen,
    accent: "marine",
    label: "First-Principles Explanations",
    desc: "Every lesson is written from the ground up, explaining not just what but why — with clear derivations and physical intuition.",
    tag: "Deep Theory",
  },
  {
    icon: CheckCircle2,
    accent: "jade",
    label: "Targeted Practice Questions",
    desc: "Carefully designed problems that catch common misconceptions and walk you through the correct reasoning step by step.",
    tag: "Active Recall",
  },
  {
    icon: FileText,
    accent: "solar",
    label: "Clean Document & PDF Export",
    desc: "Switch between the interactive lab and a publication-ready document view you can print or save for offline study.",
    tag: "Export Ready",
  },
];

const STAT_ROWS = [
  { value: "Interactive", label: "Visual Simulations", desc: "Live parameter sliders" },
  { value: "First Principles", label: "In-Depth Theory", desc: "Step-by-step logic" },
  { value: "Instant Feedback", label: "Practice Quizzes", desc: "Clear solution steps" },
  { value: "PDF & HTML", label: "Offline Reading", desc: "Print or download anytime" },
];

const accentMap: Record<string, {
  pillBg: string; pillText: string;
  iconBg: string; iconText: string;
  border: string; glowShadow: string;
  barColor: string;
}> = {
  cobalt: {
    pillBg: "bg-cobalt-100 dark:bg-cobalt-900/50",
    pillText: "text-cobalt-700 dark:text-cobalt-300",
    iconBg: "bg-cobalt-100 dark:bg-cobalt-900/60",
    iconText: "text-cobalt-600 dark:text-cobalt-400",
    border: "hover:border-cobalt-400/50 dark:hover:border-cobalt-500/40",
    glowShadow: "hover:shadow-cobalt-500/10",
    barColor: "bg-cobalt-500",
  },
  marine: {
    pillBg: "bg-cyan-100 dark:bg-cyan-900/50",
    pillText: "text-cyan-700 dark:text-cyan-300",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/60",
    iconText: "text-cyan-600 dark:text-cyan-400",
    border: "hover:border-cyan-400/50 dark:hover:border-cyan-500/40",
    glowShadow: "hover:shadow-cyan-500/10",
    barColor: "bg-marine-500",
  },
  jade: {
    pillBg: "bg-emerald-100 dark:bg-emerald-900/50",
    pillText: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
    iconText: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-400/50 dark:hover:border-emerald-500/40",
    glowShadow: "hover:shadow-emerald-500/10",
    barColor: "bg-jade-500",
  },
  solar: {
    pillBg: "bg-amber-100 dark:bg-amber-900/50",
    pillText: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-900/60",
    iconText: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-400/50 dark:hover:border-amber-500/40",
    glowShadow: "hover:shadow-amber-500/10",
    barColor: "bg-solar-500",
  },
};

export default function LowerSection() {
  return (
    <section className="relative overflow-hidden">
      
      {/* Subtle bg decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[600px] h-[300px] bg-cobalt-500/[0.04] dark:bg-cobalt-500/[0.07] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[200px] bg-marine-500/[0.05] dark:bg-marine-500/[0.06] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-24 space-y-24">

        {/* ── Stat Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {STAT_ROWS.map((s, i) => (
            <div
              key={i}
              className="relative group p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 hover:border-cobalt-300/60 dark:hover:border-cobalt-700/50 transition-all duration-200 hover:shadow-lg hover:shadow-cobalt-500/10 text-center overflow-hidden"
            >
              {/* Top colour bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cobalt-500 to-marine-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1 leading-tight">
                {s.value}
              </div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.label}</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Feature section ── */}
        <div className="space-y-12">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-50 dark:bg-cobalt-950/50 border border-cobalt-200/70 dark:border-cobalt-800/60 text-xs font-semibold text-cobalt-700 dark:text-cobalt-300 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-500 animate-pulse" />
              What's inside every lesson
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
              Designed for genuine{" "}
              <span className="text-gradient">understanding</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
              No shallow summaries. Every lesson combines interactive tools, rigorous explanations, 
              and guided practice to help you truly master the concept.
            </p>
          </div>

          {/* Feature cards — 2×2 grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => {
              const a = accentMap[f.accent];
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`group relative flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/60 ${a.border} transition-all duration-200 hover:shadow-xl ${a.glowShadow} overflow-hidden`}
                >
                  {/* Colour accent top-bar */}
                  <div className={`absolute top-0 left-6 right-6 h-px ${a.barColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                  {/* Icon + tag row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl ${a.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${a.iconText}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${a.pillBg} ${a.pillText}`}>
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                    {f.label}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed flex-1">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom CTA banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cobalt-600 via-cobalt-700 to-cobalt-800 p-8 sm:p-12 text-center">
          {/* Background texture */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute top-0 right-0 w-64 h-64 bg-marine-400/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">
              Ready to start learning?
            </h3>
            <p className="text-cobalt-200 text-sm sm:text-base mb-8 max-w-md mx-auto leading-relaxed">
              Pick any topic and get a fully interactive lesson built just for you in under 30 seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-cobalt-50 text-cobalt-700 font-bold text-sm transition-all shadow-xl shadow-cobalt-900/30 active:scale-95 cursor-pointer"
              >
                <span>Build My First Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/lessons"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-bold text-sm transition-all backdrop-blur-sm cursor-pointer"
              >
                Browse Lessons
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-slate-200/60 dark:border-slate-800/60 py-8 px-6 text-center">
        <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          LessonCrafter &copy; 2026 &mdash; Interactive Learning Platform
        </p>
      </div>
    </section>
  );
}
