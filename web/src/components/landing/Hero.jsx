import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  CalendarClock,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Music2,
} from "lucide-react";

const CHIPS = [
  { name: "Instagram", icon: Instagram, on: true },
  { name: "X", icon: Twitter, on: true },
  { name: "LinkedIn", icon: Linkedin, on: true },
  { name: "TikTok", icon: Music2, on: true },
  { name: "Facebook", icon: Facebook, on: false },
];

function PlatformChip({ chip }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium ${
        chip.on
          ? "border-green-500/40 bg-green-500/10 text-green-300"
          : "border-white/10 bg-white/[0.03] text-neutral-500"
      }`}
    >
      <chip.icon size={11} />
      {chip.name}
      {chip.on && <Check size={10} className="text-green-400" />}
    </span>
  );
}

function ComposerMock() {
  return (
    <div className="relative max-w-md w-full mx-auto lg:mr-0">
      <div className="absolute -inset-10 rounded-full bg-green-500/10 blur-[110px] pointer-events-none" />

      <div className="relative rounded-2xl border border-white/10 bg-[#101214] shadow-2xl shadow-black/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-neutral-400 text-xs font-medium">New post</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/10 px-2 py-1 text-[10px] text-neutral-300">
            <Sparkles size={10} className="text-green-400" />
            AI rephrase
          </span>
        </div>

        <div className="px-5 pt-4 pb-3">
          <p className="text-neutral-200 text-sm leading-relaxed">
            Just shipped the biggest update yet — one tap and this post lands
            on every platform we&apos;re on.
            <span className="text-green-400"> #buildinpublic</span>
          </p>
          <span className="inline-block w-0.5 h-4 bg-green-400 align-middle ml-1 animate-pulse-dot" />
        </div>

        <div className="flex flex-wrap gap-2 px-5 pb-4">
          {CHIPS.map((chip) => (
            <PlatformChip key={chip.name} chip={chip} />
          ))}
          <span className="inline-flex items-center rounded-full border border-dashed border-white/15 px-2.5 py-1.5 text-[11px] text-neutral-500">
            +3 more
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/[0.06] bg-white/[0.015]">
          <span className="inline-flex items-center gap-1.5 text-neutral-400 text-xs">
            <CalendarClock size={13} className="text-neutral-500" />
            Fri · 9:00 AM
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-xs font-semibold text-white">
            Publish to 4 platforms
            <ArrowRight size={12} />
          </span>
        </div>
      </div>

      <div className="absolute -top-5 -right-3 sm:-right-8 flex items-center gap-2 rounded-xl border border-white/10 bg-[#15181b]/95 backdrop-blur px-3.5 py-2.5 shadow-xl shadow-black/50 animate-float">
        <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
          <Check size={11} className="text-green-400" />
        </span>
        <div>
          <p className="text-white text-[11px] font-semibold leading-tight">
            Published to Instagram
          </p>
          <p className="text-neutral-500 text-[10px] leading-tight">just now</p>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 sm:-left-8 flex items-center gap-2 rounded-xl border border-white/10 bg-[#15181b]/95 backdrop-blur px-3.5 py-2.5 shadow-xl shadow-black/50">
        <span className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
          <CalendarClock size={11} className="text-green-400" />
        </span>
        <p className="text-neutral-300 text-[11px] font-medium">
          3 posts scheduled this week
        </p>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative flex items-center min-h-[80vh] pt-28 pb-20 md:pt-32 md:pb-24 px-5 md:px-6 overflow-hidden">
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      <div className="relative w-full max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 mb-7 animate-fade-in-up">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            <span className="text-neutral-300 text-xs font-medium">
              Publish to 8+ platforms at once
            </span>
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.06] tracking-tight text-white mb-6 animate-fade-in-up delay-100">
            Write once.
            <br />
            Post <span className="text-green-400">everywhere.</span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-lg mb-9 leading-relaxed animate-fade-in-up delay-200">
            The fastest way to publish, schedule, and track your content across
            every social platform — from one clean dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-9 animate-fade-in-up delay-300">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 bg-green-500 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-green-600 transition-all duration-200 text-sm shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
            >
              Start for free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="text-center text-neutral-200 hover:text-white font-medium text-sm px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/[0.03] transition-colors duration-200"
            >
              See how it works
            </a>
          </div>

          <div className="flex items-center gap-3 animate-fade-in-up delay-400">
            <div className="flex -space-x-2">
              {["from-green-400 to-emerald-600", "from-sky-400 to-blue-600", "from-amber-400 to-orange-600"].map((g) => (
                <span
                  key={g}
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-[#0a0a0a]`}
                />
              ))}
            </div>
            <p className="text-neutral-500 text-sm">
              Trusted by creators posting every day
            </p>
          </div>
        </div>

        <div className="animate-fade-in-up delay-300">
          <ComposerMock />
        </div>
      </div>
    </section>
  );
}
