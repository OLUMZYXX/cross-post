const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    quote:
      "Cross-Post cut my posting time by 80%. I used to spend an hour copying content across platforms — now it takes one click.",
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    quote:
      "The scheduling feature is a game changer. I batch my content on Sundays and Cross-Post handles the rest of the week.",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    quote:
      "AI rephrase is incredibly useful. It adapts the tone for LinkedIn vs TikTok perfectly. Our engagement went up 40%.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white">
            Loved by creators
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 hover:border-white/[0.14] transition-colors duration-200"
            >
              <span className="font-headline text-green-500/60 text-4xl leading-none select-none mb-4">
                &ldquo;
              </span>
              <blockquote className="text-neutral-300 text-base leading-relaxed flex-1 mb-7">
                {t.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                  loading="lazy"
                />
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-neutral-500 text-xs">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
