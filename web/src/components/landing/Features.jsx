import { Send, Calendar, Image, Sparkles, BarChart3, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Send,
    title: "Multi-platform posting",
    description:
      "Publish to Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram at once.",
  },
  {
    icon: Calendar,
    title: "Schedule content",
    description:
      "Plan ahead and let Cross-Post publish automatically on your schedule.",
  },
  {
    icon: Image,
    title: "Media support",
    description:
      "Upload images and videos with automatic optimization for each platform.",
  },
  {
    icon: Sparkles,
    title: "AI rephrase",
    description:
      "Rewrite captions in different tones — casual, professional, or funny — powered by AI.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Track success rates, weekly activity, and platform breakdowns at a glance.",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "Two-factor authentication, encrypted tokens, and no access to your platform passwords.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            Features
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white">
            Everything you need to post smarter
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="border-t border-white/10 pt-6">
              <feature.icon size={22} className="text-green-400 mb-5" />
              <h3 className="text-white font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
