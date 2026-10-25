import { Zap, BookOpen, BarChart3, Globe } from "lucide-react";

export default function LowerSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-solar-500" />,
      title: "Fast Synthesis",
      description: "Parallel multi-agent pipeline compiles deep lessons and interactive sandboxes in ~15 seconds."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-cobalt-600 dark:text-cobalt-400" />,
      title: "Interactive Sandboxes",
      description: "Executable stateful visualizers, parameter sliders, and real-time mathematical simulators."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-marine-600 dark:text-marine-400" />,
      title: "Formative Quizzes",
      description: "Calibrated misconception checks with instant Socratic feedback and Born-rule accuracy."
    },
    {
      icon: <Globe className="w-6 h-6 text-jade-500" />,
      title: "Global Archive",
      description: "Search and explore public lessons across quantum computing, STEM, economics, and humanities."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white">
          Why Choose LessonCrafter?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          We combine cutting-edge AI architectures with educational best practices to create an authoritative, instrument-grade learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10 group-hover:bg-cobalt-500/10 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}