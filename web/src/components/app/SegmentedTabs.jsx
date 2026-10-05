export default function SegmentedTabs({ tabs, value, onChange, label }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto rounded-full bg-cp-deep border border-cp-rule p-1 gap-1"
    >
      {tabs.map((tab) => {
        const active = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
              active ? "bg-cp-card text-cp-ink shadow-[0_1px_3px_rgba(0,0,0,0.08)]" : "text-cp-muted hover:text-cp-ink"
            }`}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] flex items-center justify-center tabular-nums ${
                  active ? "bg-cp-ink text-cp-card" : "bg-cp-rule text-cp-muted"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
