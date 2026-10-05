export default function ChartCard({ eyebrow, title, children, className = "" }) {
  return (
    <section className={`rounded-3xl bg-cp-card border border-cp-rule p-6 ${className}`}>
      <p className="cp-eyebrow">{eyebrow}</p>
      {title ? <h3 className="font-display text-cp-ink text-xl font-semibold mt-1">{title}</h3> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
