const STATS = [
  { value: "8+", label: "Platforms supported" },
  { value: "1-click", label: "Publish to all at once" },
  { value: "$0", label: "Free forever, no limits" },
];

export default function Stats() {
  return (
    <section className="py-16 md:py-24 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              {stat.value}
            </p>
            <p className="text-neutral-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
