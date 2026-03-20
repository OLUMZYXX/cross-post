import { Send, Calendar, Image, Sparkles, BarChart3, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Send,
    title: "Multi-Platform Posting",
    description: "Publish to Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram at once.",
  },
  {
    icon: Calendar,
    title: "Schedule Content",
    description: "Plan ahead and let Cross-Post publish automatically on your schedule.",
  },
  {
    icon: Image,
    title: "Media Support",
    description: "Upload images and videos with automatic optimization for each platform.",
  },
  {
    icon: Sparkles,
    title: "AI Rephrase",
    description: "Rewrite captions in different tones — casual, professional, funny — powered by AI.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track publishing performance with success rates, weekly activity, and platform breakdowns.",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Two-factor authentication, encrypted tokens, and no access to your platform passwords.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Everything you need
          </h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Powerful features to streamline your social media workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 hover:border-neutral-700/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center mb-3">
                <feature.icon size={18} className="text-neutral-300" />
              </div>
              <h3 className="text-white font-medium text-sm mb-1.5">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-[13px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
