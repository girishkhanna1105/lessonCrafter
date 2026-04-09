import { Zap, BookOpen, BarChart3, Globe } from "lucide-react";

export default function LowerSection() {
  const features = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Instant Generation",
      description: "Generate comprehensive lessons in under 30 seconds using advanced AI models."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      title: "Interactive Content",
      description: "Lessons including quizzes, executable code blocks, and adaptive pathing."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
      title: "Progress Tracking",
      description: "Detailed analytics on your learning speed and retention rates."
    },
    {
      icon: <Globe className="w-6 h-6 text-cyan-400" />,
      title: "Global Library",
      description: "Access thousands of community-generated lessons on any subject imaginable."
    }
  ];

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose LessonCrafter?</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          We combine the power of state-of-the-art LLMs with pedagogical best practices to create the ultimate learning experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, i) => (
          <div key={i} className="glass-card p-8 group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-indigo-500/10 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}