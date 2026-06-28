const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Content Creator",
    quote:
      "Cross-Post cut my posting time by 80%. I used to spend an hour copying content across platforms — now it takes one click.",
  },
  {
    name: "Marcus Johnson",
    role: "Small Business Owner",
    quote:
      "The scheduling feature is a game changer. I batch my content on Sundays and Cross-Post handles the rest of the week.",
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing Manager",
    quote:
      "AI rephrase is incredibly useful. It adapts the tone for LinkedIn vs TikTok perfectly. Our engagement went up 40%.",
  },
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl mb-12 md:mb-16">
          <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-4">
            Testimonials
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Loved by creators
          </h2>
          <p className="text-neutral-400 text-base">
            See what our users have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 flex flex-col"
            >
              <p className="text-neutral-300 text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-300 text-xs font-semibold">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-neutral-500 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
