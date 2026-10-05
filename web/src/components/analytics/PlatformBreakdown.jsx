import ChartCard from "@/components/analytics/ChartCard";
import { platformIcon, platformLabel } from "@/config/platformIcons";

export default function PlatformBreakdown({ platforms }) {
  return (
    <ChartCard eyebrow="By platform" title="Where your posts go">
      {platforms.length === 0 ? (
        <p className="text-cp-muted text-sm py-6">No platform data yet.</p>
      ) : (
        <ul className="space-y-4">
          {platforms.map((platform) => {
            const Icon = platformIcon(platform.name);
            return (
              <li key={platform.name} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-cp-deep border border-cp-rule flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-cp-ink" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-cp-ink font-semibold">{platformLabel(platform.name)}</span>
                    <span className="text-cp-muted tabular-nums">
                      {platform.total} post{platform.total === 1 ? "" : "s"} · {platform.successRate}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-cp-deep mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${platform.successRate >= 80 ? "bg-cp-olive" : "bg-cp-accent"}`}
                      style={{ width: `${platform.successRate}%` }}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </ChartCard>
  );
}
