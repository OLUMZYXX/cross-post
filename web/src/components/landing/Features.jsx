import {
  Send,
  Calendar,
  Image,
  Sparkles,
  BarChart3,
  Shield,
} from "lucide-react";

const FEATURES = [
  {
    icon: Send,
    title: "Multi-Platform Posting",
    description:
      "Publish to Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram at once.",
  },
  {
    icon: Calendar,
    title: "Schedule Content",
    description:
      "Plan ahead and let Cross-Post publish automatically on your schedule.",
  },
  {
    icon: Image,
    title: "Media Support",
    description:
      "Upload images and videos with automatic optimization for each platform.",
  },
  {
    icon: Sparkles,
    title: "AI Rephrase",
    description:
      "Rewrite captions in different tones — casual, professional, funny — powered by AI.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track publishing performance with success rates, weekly activity, and platform breakdowns.",
  },
  {
    icon: Shield,
    title: "Secure",
    description:
      "Two-factor authentication, encrypted tokens, and no access to your platform passwords.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-14 md:py-24 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            Everything you need
          </h2>
          <p className="text-neutral-400 text-xs md:text-base max-w-md mx-auto">
            Powerful features to streamline your social media workflow
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`group glass rounded-xl md:rounded-2xl p-4 md:p-6 hover:bg-white/[0.04] transition-all duration-300 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/[0.06] flex items-center justify-center mb-3 md:mb-4 group-hover:bg-green-500/10 transition-colors duration-300">
                <span className="md:hidden"><feature.icon size={15} className="text-neutral-400 group-hover:text-green-400 transition-colors duration-300" /></span>
                <span className="hidden md:inline-flex"><feature.icon size={18} className="text-neutral-400 group-hover:text-green-400 transition-colors duration-300" /></span>
              </div>
              <h3 className="text-white font-semibold text-xs md:text-[15px] mb-1 md:mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-500 text-[11px] md:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
