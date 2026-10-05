import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthYear } from "@/utils/calendarHelpers";
import { platformIcon, platformLabel } from "@/config/platformIcons";

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cp-press shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active ? "bg-cp-ink border-cp-ink text-cp-card" : "bg-cp-card border-cp-rule text-cp-ink hover:border-cp-soft"
      }`}
    >
      {children}
    </button>
  );
}

export default function CalendarToolbar({ calendar, platformNames }) {
  const uniqueNames = [...new Set(platformNames.map((name) => name.split(":")[0]))];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={calendar.previousMonth}
          aria-label="Previous month"
          className="cp-press w-10 h-10 rounded-full border border-cp-rule bg-cp-card flex items-center justify-center text-cp-ink hover:bg-cp-deep"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="font-display text-cp-ink text-2xl font-semibold min-w-[190px] text-center">
          {formatMonthYear(calendar.year, calendar.month)}
        </h2>
        <button
          type="button"
          onClick={calendar.nextMonth}
          aria-label="Next month"
          className="cp-press w-10 h-10 rounded-full border border-cp-rule bg-cp-card flex items-center justify-center text-cp-ink hover:bg-cp-deep"
        >
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          onClick={calendar.goToToday}
          className="ml-2 rounded-full px-3.5 py-2 text-[13px] font-semibold text-cp-accent hover:bg-cp-accent-soft transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <FilterChip active={calendar.platformFilter === "all"} onClick={() => calendar.setPlatformFilter("all")}>
          All channels
        </FilterChip>
        {uniqueNames.map((name) => {
          const key = name.toLowerCase();
          const Icon = platformIcon(name);
          const active = calendar.platformFilter === key;
          return (
            <FilterChip key={name} active={active} onClick={() => calendar.setPlatformFilter(active ? "all" : key)}>
              <Icon size={14} />
              {platformLabel(name)}
            </FilterChip>
          );
        })}
      </div>
    </div>
  );
}
