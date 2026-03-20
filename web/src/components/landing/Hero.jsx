import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-[1400px] mx-auto text-center">
        <div className="inline-block bg-neutral-900 border border-neutral-800 rounded-full px-4 py-1 mb-8">
          <span className="text-neutral-400 text-xs">
            Publish to 8+ platforms at once
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
          Social media,
          <br />
          <span className="text-green-400">simplified.</span>
        </h1>

        <p className="text-neutral-400 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Write once, publish everywhere. Schedule posts, manage platforms, and
          track performance from a single dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="group flex items-center gap-2 bg-white text-black font-medium px-6 py-2.5 rounded-lg hover:bg-neutral-200 transition-colors text-sm"
          >
            Start for free
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href="#features"
            className="text-neutral-400 hover:text-white text-sm px-6 py-2.5 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
