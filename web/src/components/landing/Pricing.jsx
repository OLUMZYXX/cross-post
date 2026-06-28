import Link from "next/link";
import { Check } from "lucide-react";

const FEATURES = [
  "Connect all your social platforms",
  "Unlimited posts",
  "Analytics dashboard",
  "AI rephrase",
  "Schedule posts",
  "Copyright checker",
  "Bulk scheduling",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-5 md:px-6 border-t border-white/[0.06] bg-white/[0.015]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-4">
            Pricing
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Free to use
          </h2>
          <p className="text-neutral-400 text-base">
            Every feature, no subscription, no hidden costs.
          </p>
        </div>

        <div className="max-w-md mx-auto rounded-3xl border border-white/[0.08] bg-[#0a0a0a] p-8">
          <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-3">
            Everything included
          </p>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-headline text-5xl font-bold tracking-tight text-white">
              $0
            </span>
            <span className="text-neutral-500 text-sm">forever</span>
          </div>
          <p className="text-neutral-400 text-sm mb-7">
            All features, completely free.
          </p>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-green-400" />
                </span>
                <span className="text-neutral-300 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/signup"
            className="block text-center py-3 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
}
