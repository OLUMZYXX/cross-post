import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/landing/SectionHeading";

const PLANS = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Everything you need to start posting from one place.",
    features: [
      "Connect 7 social platforms",
      "Unlimited posts and scheduling",
      "AI rephrase",
      "Analytics dashboard",
      "Copyright checker",
    ],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "₦5,000",
    period: "per month",
    description: "For creators and businesses who need every platform.",
    badge: "7-day free trial",
    features: [
      "Everything in Free",
      "Post to Twitter / X",
      "6 months for ₦24,000 (save 20%)",
      "1 year for ₦43,000 (save 28%)",
      "Priority support",
    ],
    cta: "Start free trial",
    featured: true,
  },
];

function PlanCard({ plan }) {
  const dark = plan.featured;

  return (
    <div className={`w-full rounded-3xl p-8 md:p-10 flex flex-col ${dark ? "bg-forest" : "bg-white border border-line"}`}>
      <div className="flex items-center justify-between">
        <h3 className={`font-display text-2xl font-semibold ${dark ? "text-white" : "text-ink"}`}>
          {plan.name}
        </h3>
        {plan.badge ? (
          <span className="rounded-full bg-mint text-forest text-xs font-semibold px-3 py-1">
            {plan.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-6 flex items-baseline gap-2">
        <span className={`font-display text-5xl font-semibold tracking-tight ${dark ? "text-white" : "text-ink"}`}>
          {plan.price}
        </span>
        <span className={dark ? "text-white/60" : "text-ink-muted"}>{plan.period}</span>
      </p>
      <p className={`mt-3 ${dark ? "text-white/70" : "text-ink-soft"}`}>{plan.description}</p>

      <ul className="mt-8 space-y-3.5 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check size={18} className={`mt-0.5 shrink-0 ${dark ? "text-mint" : "text-leaf"}`} />
            <span className={dark ? "text-white/85" : "text-ink"}>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/signup"
        className={`mt-10 block text-center py-3.5 rounded-full font-medium transition-colors ${
          dark ? "bg-mint text-forest hover:bg-white" : "bg-forest text-white hover:bg-forest-soft"
        }`}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 md:px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title="Start free. Upgrade when you need X."
            intro="Every new account gets 7 days of Pro, no card required."
          />
        </Reveal>

        <div className="mt-14 grid md:grid-cols-2 gap-5">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.name} variant="scale" delay={index * 120} className="flex">
              <PlanCard plan={plan} />
            </Reveal>
          ))}
        </div>

        <p className="text-ink-muted text-sm text-center mt-8">
          Pro is purchased and managed in the Cross-Post mobile app.
        </p>
      </div>
    </section>
  );
}
