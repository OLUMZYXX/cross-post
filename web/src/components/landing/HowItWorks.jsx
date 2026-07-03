import { Link2, PenSquare, Rocket } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Link2,
    title: "Connect platforms",
    description:
      "Link your Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram accounts in seconds.",
  },
  {
    number: "02",
    icon: PenSquare,
    title: "Create content",
    description:
      "Write your post, upload media, and use AI to rephrase for each platform's tone and audience.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Publish everywhere",
    description:
      "Hit publish or schedule for later. Cross-Post handles formatting and delivery to every platform at once.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06] bg-white/[0.015]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            How it works
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white">
            Three simple steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-10">
          {STEPS.map((step) => (
            <div key={step.number}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <step.icon size={19} className="text-green-400" />
                </div>
                <span className="text-white/15 text-3xl font-bold select-none">
                  {step.number}
                </span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {step.title}
              </h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
