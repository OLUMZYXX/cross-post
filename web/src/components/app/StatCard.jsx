const TONES = {
  accent: { text: "text-cp-accent", bg: "bg-cp-accent-soft", dot: "bg-cp-accent" },
  info: { text: "text-cp-info", bg: "bg-cp-info-soft", dot: "bg-cp-info" },
  olive: { text: "text-cp-olive", bg: "bg-cp-olive-soft", dot: "bg-cp-olive" },
};

export default function StatCard({ icon: Icon, label, value, tone = "accent", hint }) {
  const palette = TONES[tone] || TONES.accent;

  return (
    <div className="rounded-3xl bg-cp-card border border-cp-rule p-5">
      <div className="flex items-center justify-between">
        <span className={`w-10 h-10 rounded-2xl flex items-center justify-center ${palette.bg}`}>
          <Icon size={19} className={palette.text} />
        </span>
        <span className={`w-1.5 h-1.5 rounded-full opacity-60 ${palette.dot}`} />
      </div>
      <p className="font-display text-cp-ink text-[34px] leading-none font-semibold mt-5 tabular-nums">
        {value}
      </p>
      <p className="cp-eyebrow mt-2">{label}</p>
      {hint ? <p className="text-cp-soft text-xs mt-1">{hint}</p> : null}
    </div>
  );
}
