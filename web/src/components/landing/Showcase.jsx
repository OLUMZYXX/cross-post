import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";

const CHIPS = [
  {
    icon: CheckCircle2,
    title: "8 platforms",
    subtitle: "published in one tap",
    position: "top-6 right-6",
  },
  {
    icon: Clock,
    title: "5+ hours saved",
    subtitle: "every single week",
    position: "bottom-6 left-6",
  },
];

export default function Showcase() {
  return (
    <section className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="relative order-2 lg:order-1">
          <div className="absolute -inset-6 rounded-[2rem] bg-green-500/10 blur-[80px] pointer-events-none" />
          <div className="relative rounded-3xl overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80&auto=format&fit=crop"
              alt="Creator managing social media content"
              className="w-full aspect-[4/3] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent" />

            {CHIPS.map((chip) => (
              <div
                key={chip.title}
                className={`absolute ${chip.position} flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#101214]/90 backdrop-blur px-4 py-3 shadow-xl shadow-black/40`}
              >
                <span className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center">
                  <chip.icon size={15} className="text-green-400" />
                </span>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">
                    {chip.title}
                  </p>
                  <p className="text-neutral-400 text-[10px] leading-tight">
                    {chip.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            Built for creators
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
            Spend your time creating, not copy-pasting
          </h2>
          <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-md">
            Your audience lives on different platforms — your workflow
            shouldn&apos;t. Compose once, pick your platforms, and Cross-Post
            handles the formatting, delivery, and tracking for every one of
            them.
          </p>

          <div className="flex items-center gap-10">
            <div>
              <p className="font-headline text-3xl font-bold text-white flex items-center gap-2">
                80%
                <TrendingUp size={20} className="text-green-400" />
              </p>
              <p className="text-neutral-500 text-sm mt-1">less time posting</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="font-headline text-3xl font-bold text-white">1 tap</p>
              <p className="text-neutral-500 text-sm mt-1">to reach everyone</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
