import { Link2, PenSquare, Rocket } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Connect Platforms",
    description:
      "Link your Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram accounts in seconds.",
  },
  {
    number: "02",
    icon: PenSquare,
    title: "Create Content",
    description:
      "Write your post, upload media, and use AI to rephrase for each platform's tone and audience.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Publish Everywhere",
    description:
      "Hit publish or schedule for later. Cross-Post handles formatting and delivery to every platform at once.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-14 md:py-24 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(34,197,94,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            How it works
          </h2>
          <p className="text-neutral-400 text-xs md:text-base max-w-md mx-auto">
            Three simple steps to reach every audience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`glass rounded-xl md:rounded-2xl p-5 md:p-7 relative animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <span className="text-green-500/20 text-4xl md:text-5xl font-extrabold absolute top-4 right-5 md:top-5 md:right-6 select-none">
                {step.number}
              </span>
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-green-500/10 flex items-center justify-center mb-4 md:mb-5">
                <span className="md:hidden"><step.icon size={16} className="text-green-400" /></span>
                <span className="hidden md:inline-flex"><step.icon size={20} className="text-green-400" /></span>
              </div>
              <h3 className="text-white font-bold text-sm md:text-base mb-1.5 md:mb-2">
                {step.title}
              </h3>
              <p className="text-neutral-500 text-[11px] md:text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
