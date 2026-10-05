export default function SectionHeading({ eyebrow, title, intro, tone = "light", align = "left" }) {
  const isDark = tone === "dark";
  const alignment = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? (
        <p className={`text-sm font-medium mb-4 ${isDark ? "text-mint" : "text-leaf"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`font-display text-[2rem] md:text-[2.75rem] leading-[1.08] font-medium tracking-[-0.02em] ${
          isDark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p className={`mt-5 text-lg leading-relaxed ${isDark ? "text-white/70" : "text-ink-soft"}`}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
