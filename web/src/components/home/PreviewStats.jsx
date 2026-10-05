export default function PreviewStats({ sent, scheduled, platforms }) {
  const items = [
    { label: "Sent", value: sent },
    { label: "Scheduled", value: scheduled },
    { label: "Platforms", value: platforms },
  ];

  return (
    <section aria-label="Preview">
      <p className="cp-eyebrow mb-3">Preview</p>
      <div className="grid grid-cols-3 divide-x divide-cp-rule rounded-3xl bg-cp-card border border-cp-rule py-5">
        {items.map((item) => (
          <div key={item.label} className="px-5">
            <p className="font-display text-cp-ink text-[32px] leading-none font-semibold tabular-nums">
              {item.value}
            </p>
            <p className="cp-eyebrow mt-2 !text-[10px]">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
