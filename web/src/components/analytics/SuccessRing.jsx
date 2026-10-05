import { CheckCircle2, XCircle } from "lucide-react";
import ChartCard from "@/components/analytics/ChartCard";

const RADIUS = 15.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SuccessRing({ outcomes }) {
  const filled = (outcomes.successRate / 100) * CIRCUMFERENCE;

  return (
    <ChartCard eyebrow="Delivery" title="Success rate">
      {outcomes.total === 0 ? (
        <p className="text-cp-muted text-sm py-6">Publish a post to see how it lands on each platform.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r={RADIUS} fill="none" stroke="var(--cp-rule)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r={RADIUS}
                fill="none"
                stroke="var(--cp-olive)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-cp-ink text-2xl font-semibold">
              {outcomes.successRate}%
            </span>
          </div>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm text-cp-ink">
              <CheckCircle2 size={16} className="text-cp-olive" />
              <b className="tabular-nums">{outcomes.totalSuccess}</b> delivered
            </p>
            <p className="flex items-center gap-2 text-sm text-cp-ink">
              <XCircle size={16} className="text-cp-accent" />
              <b className="tabular-nums">{outcomes.totalFailed}</b> failed
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
