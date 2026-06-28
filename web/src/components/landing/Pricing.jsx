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
    <section id="pricing" className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            Free to use
          </h2>
          <p className="text-neutral-400 text-xs md:text-base">
            Every feature, no subscription, no hidden costs
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="relative rounded-xl md:rounded-2xl p-5 md:p-7 glass gradient-border bg-white/[0.03]">
            <span className="inline-block text-green-400 text-[10px] md:text-[11px] font-semibold mb-2 md:mb-3 tracking-wide uppercase">
              Everything included
            </span>
            <h3 className="text-white text-base md:text-lg font-bold">Free</h3>
            <div className="flex items-baseline gap-1 mt-1 mb-1">
              <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                $0
              </span>
              <span className="text-neutral-500 text-xs md:text-sm">forever</span>
            </div>
            <p className="text-neutral-500 text-xs md:text-sm mb-4 md:mb-6">
              All features, completely free
            </p>

            <ul className="space-y-2 md:space-y-3 mb-5 md:mb-7">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="md:hidden"><Check size={10} className="text-green-400" /></span>
                    <span className="hidden md:inline-flex"><Check size={12} className="text-green-400" /></span>
                  </div>
                  <span className="text-neutral-300 text-xs md:text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="block text-center py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
