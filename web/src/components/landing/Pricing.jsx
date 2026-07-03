import Link from "next/link";
import { Check, Star } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Everything you need to start posting smarter",
    features: [
      "Connect 7 social platforms",
      "Unlimited posts & scheduling",
      "AI rephrase",
      "Analytics dashboard",
      "Copyright checker",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₦5,000",
    period: "/month",
    description: "For creators who need every platform",
    badge: "7-day free trial",
    features: [
      "Everything in Free",
      "Post to Twitter / X",
      "6-month plan — ₦24,000 (save 20%)",
      "Yearly plan — ₦43,000 (save 28%)",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            Pricing
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Start free, upgrade when you need
          </h2>
          <p className="text-neutral-400 text-lg">
            Every new account gets 7 days of Pro — no card required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 md:p-8 border transition-colors duration-200 ${
                plan.highlighted
                  ? "border-green-500/30 bg-green-500/[0.04]"
                  : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-[11px] font-semibold text-white">
                  <Star size={10} />
                  {plan.badge}
                </span>
              )}

              <h3 className="text-white text-lg font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1.5 mt-2 mb-1">
                <span className="font-headline text-4xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>
                <span className="text-neutral-500 text-sm">{plan.period}</span>
              </div>
              <p className="text-neutral-400 text-base mb-7">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-green-400" />
                    </span>
                    <span className="text-neutral-300 text-[15px]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-3 rounded-xl text-sm font-semibold transition-colors duration-200 ${
                  plan.highlighted
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-white/[0.06] text-neutral-200 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-neutral-600 text-xs text-center mt-8">
          Pro subscriptions are purchased and managed in the Cross-Post iOS app.
        </p>
      </div>
    </section>
  );
}
