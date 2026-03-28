import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    quote:
      "Cross-Post cut my posting time by 80%. I used to spend an hour copying content across platforms — now it takes one click.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    quote:
      "The scheduling feature is a game changer. I batch my content on Sundays and Cross-Post handles the rest of the week.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    quote:
      "AI rephrase is incredibly useful. It adapts the tone for LinkedIn vs TikTok perfectly. Our engagement went up 40%.",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-14 md:py-24 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.03)_0%,_transparent_70%)]" />

      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            Loved by creators
          </h2>
          <p className="text-neutral-400 text-xs md:text-base max-w-md mx-auto">
            See what our users have to say
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className={`glass rounded-xl md:rounded-2xl p-5 md:p-6 animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="flex gap-0.5 mb-3 md:mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={12}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-neutral-300 text-[11px] md:text-sm leading-relaxed mb-4 md:mb-5">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-white text-xs md:text-sm font-semibold">
                  {t.name}
                </p>
                <p className="text-neutral-500 text-[10px] md:text-xs">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
