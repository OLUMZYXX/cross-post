import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";
import { CaptionVisual, ScheduleVisual, StatusVisual } from "@/components/landing/FeatureVisuals";
import { FEATURE_HIGHLIGHTS } from "@/config/featureHighlights";

const CARDS = [
  {
    title: "A caption for every platform",
    body: "Write one caption and AI reshapes it to fit each network's length and tone, keeping your facts intact.",
    visual: CaptionVisual,
    dark: false,
  },
  {
    title: "Plan the week in one sitting",
    body: "Pick a date and time for each post and Cross-Post publishes it for you, even when your phone is off.",
    visual: ScheduleVisual,
    dark: true,
  },
  {
    title: "Know exactly what landed",
    body: "Every post shows its result on each platform, the reason if one refused it, and a retry for just that one.",
    visual: StatusVisual,
    dark: false,
  },
];

export default function Features() {
  return (
    <section id="features" className="px-4 md:px-6 py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto">
        <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading eyebrow="What it does" title="The boring part of posting, handled." />
          <Link
            href="/features"
            className="group inline-flex items-center gap-1.5 text-ink font-semibold hover:text-leaf transition-colors shrink-0"
          >
            All features
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-3 gap-5">
          {CARDS.map((card, index) => (
            <Reveal
              key={card.title}
              as="article"
              delay={index * 120}
              className={`rounded-3xl p-7 md:p-8 flex flex-col transition-transform duration-300 hover:-translate-y-1 ${
                card.dark ? "bg-forest" : "bg-sand"
              }`}
            >
              <h3 className={`font-display text-2xl ${card.dark ? "text-white" : "text-ink"}`}>
                {card.title}
              </h3>
              <p className={`mt-3 leading-relaxed ${card.dark ? "text-white/70" : "text-ink-soft"}`}>
                {card.body}
              </p>
              <div className="mt-auto pt-8">
                <card.visual />
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {FEATURE_HIGHLIGHTS.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 4) * 90}>
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-white border border-line">
                <feature.icon size={20} className="text-leaf" strokeWidth={1.75} />
              </span>
              <h3 className="text-ink font-semibold text-lg mt-4">{feature.title}</h3>
              <p className="text-ink-soft leading-relaxed mt-1.5">{feature.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
