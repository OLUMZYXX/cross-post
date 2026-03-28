import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Up to 3 connected platforms",
      "10 posts per month",
      "Basic analytics",
      "AI rephrase (5/month)",
      "Schedule posts",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious content creators",
    features: [
      "Unlimited platforms",
      "Unlimited posts",
      "Advanced analytics",
      "Unlimited AI rephrase",
      "Priority support",
      "Copyright checker",
      "Bulk scheduling",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            Simple pricing
          </h2>
          <p className="text-neutral-400 text-xs md:text-base">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl md:rounded-2xl p-5 md:p-7 transition-all duration-300 ${
                plan.highlighted
                  ? "glass gradient-border bg-white/[0.03] hover:bg-white/[0.05]"
                  : "glass hover:bg-white/[0.03]"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block text-green-400 text-[10px] md:text-[11px] font-semibold mb-2 md:mb-3 tracking-wide uppercase">
                  Most Popular
                </span>
              )}
              <h3 className="text-white text-base md:text-lg font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {plan.price}
                </span>
                <span className="text-neutral-500 text-xs md:text-sm">{plan.period}</span>
              </div>
              <p className="text-neutral-500 text-xs md:text-sm mb-4 md:mb-6">
                {plan.description}
              </p>

              <ul className="space-y-2 md:space-y-3 mb-5 md:mb-7">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-md bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check size={10} className="text-green-400 md:hidden" />
                      <Check size={12} className="text-green-400 hidden md:block" />
                    </div>
                    <span className="text-neutral-300 text-xs md:text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-2 md:py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-neutral-200 shadow-lg shadow-white/5"
                    : "bg-white/[0.06] text-neutral-300 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
