import ChartCard from "@/components/analytics/ChartCard";

export default function WeeklyBars({ weekly }) {
  const total = weekly.days.reduce((sum, day) => sum + day.count, 0);

  return (
    <ChartCard eyebrow="Last 7 days" title={`${total} post${total === 1 ? "" : "s"} sent`}>
      <div className="flex items-end gap-2 sm:gap-3 h-36" role="img" aria-label="Posts sent per day over the last week">
        {weekly.days.map((day, index) => {
          const height = weekly.maxCount > 0 ? (day.count / weekly.maxCount) * 100 : 0;
          const isToday = index === weekly.days.length - 1;
          return (
            <div key={`${day.label}-${index}`} className="flex-1 min-w-0 flex flex-col items-center gap-2 h-full">
              <span className="text-cp-muted text-[11px] font-semibold tabular-nums">{day.count || ""}</span>
              <div className="w-full flex-1 rounded-xl bg-cp-deep overflow-hidden flex items-end">
                <div
                  className={`w-full rounded-xl transition-[height] duration-700 ${isToday ? "bg-cp-accent" : "bg-cp-ink"}`}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className={`text-[11px] font-semibold ${isToday ? "text-cp-accent" : "text-cp-muted"}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
