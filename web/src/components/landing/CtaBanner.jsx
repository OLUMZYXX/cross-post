import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

const POINTS = [
  "Publish to 8+ platforms in one click",
  "Schedule and plan your content ahead",
  "Free forever — no credit card required",
];

export default function CtaBanner() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto rounded-3xl border border-white/[0.08] bg-white/[0.02] px-7 py-12 md:px-14 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
              Ready to simplify your social media?
            </h2>
            <p className="text-neutral-400 text-sm md:text-base mb-7">
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
                <span className="text-neutral-300 text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
