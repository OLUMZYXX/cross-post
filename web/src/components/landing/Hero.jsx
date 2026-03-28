import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,197,94,0.08)_0%,_transparent_60%)]" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[120px]" />

      <div className="max-w-4xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 animate-fade-in-up">
          <Sparkles size={13} className="text-green-400" />
          <span className="text-neutral-300 text-xs font-medium">
            Publish to 8+ platforms at once
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-6 tracking-tight animate-fade-in-up delay-100">
          <span className="text-gradient">Social media,</span>
          <br />
          <span className="text-gradient-green">simplified.</span>
        </h1>

        <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-200">
          Write once, publish everywhere. Schedule posts, manage platforms, and
          track performance from a single dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link
            href="/signup"
            className="group flex items-center gap-2.5 bg-white text-black font-semibold px-7 py-3 rounded-xl hover:bg-neutral-100 transition-all duration-200 text-sm shadow-lg shadow-white/10 hover:shadow-white/20"
          >
            Start for free
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
          <a
            href="#features"
            className="text-neutral-300 hover:text-white text-sm px-7 py-3 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
