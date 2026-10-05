export default function PhoneMockup({ src, alt, className = "", screenKey, priority = false }) {
  return (
    <div
      className={`relative aspect-[393/852] rounded-[17%/8%] bg-[#141414] p-[3.2%] shadow-[0_40px_80px_-24px_rgba(2,44,34,0.45),0_12px_28px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/40 ${className}`}
    >
      <span className="absolute -left-[1.4%] top-[19%] h-[6%] w-[1.4%] rounded-l bg-[#2a2a2a]" />
      <span className="absolute -left-[1.4%] top-[28%] h-[10%] w-[1.4%] rounded-l bg-[#2a2a2a]" />
      <span className="absolute -right-[1.4%] top-[25%] h-[13%] w-[1.4%] rounded-r bg-[#2a2a2a]" />

      <div className="relative h-full w-full overflow-hidden rounded-[14%/6.6%] bg-white">
        <img
          key={screenKey || src}
          src={src}
          alt={alt}
          className="h-full w-full object-cover object-top animate-screen-fade"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        <span className="absolute left-1/2 top-[1.3%] h-[3.6%] w-[29%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </div>
  );
}
