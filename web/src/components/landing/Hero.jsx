import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import PhoneMockup from "@/components/ui/PhoneMockup";
import { MARKETING_PLATFORMS } from "@/config/marketing";

export default function Hero() {
  return (
    <section className="px-4 md:px-6 pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <Reveal>
            <h1 className="font-display text-ink text-[3rem] sm:text-[4rem] lg:text-[5.2rem] leading-[0.98] font-medium tracking-[-0.03em]">
              Write it once.
              <br />
              Post it <em className="text-leaf italic">everywhere.</em>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-7 text-ink-soft text-lg md:text-xl leading-relaxed max-w-xl">
              Cross-Post sends one post to Instagram, TikTok, X, Facebook, LinkedIn,
              YouTube, Reddit and Telegram, so you spend your time making things
              instead of copying and pasting them.
            </p>
          </Reveal>

          <Reveal delay={220} className="mt-9 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-forest text-white font-semibold px-7 py-4 rounded-full hover:bg-forest-soft transition-colors"
            >
              Start posting free
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center justify-center text-ink font-semibold px-7 py-4 rounded-full border border-line hover:border-ink/30 hover:bg-white/60 transition-colors"
            >
              See how it works
            </Link>
          </Reveal>

          <Reveal delay={320} className="mt-12">
            <p className="text-ink-muted text-sm mb-4">Publishes to</p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-3">
              {MARKETING_PLATFORMS.map((platform) => (
                <li key={platform.name} title={platform.name}>
                  <platform.icon size={21} className="text-ink-soft" aria-label={platform.name} />
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal variant="right" delay={150} className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
          <div className="ml-auto w-[82%] rounded-[28px] overflow-hidden bg-sand aspect-[4/5]">
            <img
              src="/images/hero-creator.webp"
              alt="A creator recording a video on her phone with a ring light"
              className="w-full h-full object-cover"
              fetchPriority="high"
            />
          </div>
          <div className="absolute left-0 bottom-[-6%] w-[42%] animate-float-slow">
            <PhoneMockup
              src="/images/app/compose.webp"
              alt="The Cross-Post compose screen with Twitter, Instagram, Facebook and LinkedIn selected"
              priority
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
