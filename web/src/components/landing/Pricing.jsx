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
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Simple pricing
          </h2>
          <p className="text-neutral-400 text-sm">
            Start free, upgrade when you need more
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-6 border ${
                plan.highlighted
                  ? "bg-neutral-900 border-green-500/30"
                  : "bg-neutral-900/50 border-neutral-800/50"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block text-green-400 text-[11px] font-medium mb-3">
                  Most Popular
                </span>
              )}
              <h3 className="text-white text-lg font-semibold">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1 mb-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-neutral-500 text-sm">{plan.period}</span>
              </div>
              <p className="text-neutral-500 text-xs mb-5">{plan.description}</p>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check size={14} className="text-green-400 flex-shrink-0" />
                    <span className="text-neutral-300 text-[13px]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-white text-black hover:bg-neutral-200"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
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
