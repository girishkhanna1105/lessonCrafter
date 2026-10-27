import { Zap, BookOpen, BarChart3, Globe, Sparkles, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LowerSection() {
  const stats = [
    { value: "<15s", label: "Synthesis Latency", sub: "Parallel Agent Pipeline" },
    { value: "5", label: "Specialized Agents", sub: "Gemini 2.5 + Groq 120B" },
    { value: "100%", label: "Client-Side Sandbox", sub: "Zero Server Code Execution" },
    { value: "Dual-Mode", label: "Pantone Cobalt", sub: "Void Slate & Crisp Alabaster" },
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6 text-solar-500" />,
      title: "Parallel Multi-Agent Architecture",
      description: "Concurrent generation streams interactive simulators and formative quizzes simultaneously, cutting wait times by over 55%."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400" />,
      title: "Interactive Live Sandboxes",
      description: "Executable stateful visualizers, mathematical sliders, and real-time SVG diagrams synthesized cleanly without imports."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-marine-600 dark:text-marine-400" />,
      title: "Formative Misconception Quizzes",
      description: "Powered by Groq OSS-120B to craft calibrated distractors that detect cognitive stumbling blocks and provide step-by-step explanations."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
      title: "Double-Safety AST Hardening",
      description: "Sandboxed react-live execution environment with automatic AST repair loop and a 2-attempt safety ceiling to prevent token loops."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-cobalt-500" />,
      title: "Socratic AI Sidecar Mentor",
      description: "Docked right-hand assistant provides guided inquiry and intuition prompts without spoiling final quiz answers."
    },
    {
      icon: <Globe className="w-6 h-6 text-jade-500" />,
      title: "Offline Standalone Export",
      description: "Download standalone self-executing HTML bundles with zero external dependencies or print crisp, formatted PDF summaries."
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto space-y-24">
      
      {/* Real-time Telemetry Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-2xl border-slate-200 dark:border-white/10 text-center hover:border-cobalt-500/40 transition-all group"
          >
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
              {s.value}
            </div>
            <div className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {s.label}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Grid */}
      <div>
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-4">
            <Layers className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
            <span className="text-xs font-mono font-bold text-cobalt-700 dark:text-cobalt-300 uppercase tracking-widest">
              Instrument-Grade Platform
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">
            Engineered for Deep Conceptual Mastery
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            We blend rigorous educational theory with cutting-edge LLM reasoning to generate lessons that actively engage learners through discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-7 rounded-2xl border-slate-200 dark:border-white/10 hover:border-cobalt-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-5 border border-slate-200 dark:border-white/10 group-hover:bg-cobalt-500/10 group-hover:scale-110 transition-all">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="glass-card rounded-3xl p-8 sm:p-12 border-cobalt-500/30 bg-gradient-to-r from-cobalt-600/15 via-marine-500/10 to-transparent relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Ready to Synthesize Your First Interactive Lesson?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Input any syllabus topic or concept. Our neural pipeline will formulate curriculum sections, build an interactive simulation, and calibrate formative questions in ~15s.
          </p>
        </div>

        <Link href="/studio">
          <button className="px-8 py-4 rounded-xl bg-cobalt-600 hover:bg-cobalt-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-cobalt-600/30 flex items-center gap-2.5 transition-all active:scale-95 group flex-shrink-0 cursor-pointer">
            <Zap className="w-4 h-4 fill-white text-white" />
            <span>Launch Creation Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

    </section>
  );
}