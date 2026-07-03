import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const POINTS = [
  "Publish to 8+ platforms in one click",
  "Schedule and plan your content ahead",
  "Free to start — 7-day Pro trial included",
];

export default function CtaBanner() {
  return (
    <section className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="relative max-w-[1240px] mx-auto rounded-3xl border border-white/[0.08] px-7 py-12 md:px-16 md:py-20 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.13]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/85 via-[#0a0a0a]/60 to-[#0a0a0a]/85" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to simplify your social media?
            </h2>
            <p className="text-neutral-400 text-base md:text-lg mb-7">
              Join creators who save hours every week with Cross-Post.
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-green-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 text-sm"
            >
              Start for free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>

          <ul className="space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-green-400" />
                </span>
                <span className="text-neutral-300 text-base">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
