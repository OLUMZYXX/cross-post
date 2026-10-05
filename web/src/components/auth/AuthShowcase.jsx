import { Check } from "lucide-react";
import PhoneMockup from "@/components/ui/PhoneMockup";
import { MARKETING_PLATFORMS } from "@/config/marketing";

const POINTS = [
  "One post to eight platforms",
  "Captions tailored to each one",
  "Schedule it and get on with your day",
];

export default function AuthShowcase({ screen, screenAlt, heading }) {
  return (
    <aside className="hidden lg:flex sticky top-4 h-[calc(100vh-2rem)] min-h-[640px] flex-col justify-between overflow-hidden rounded-[28px] bg-forest p-12 xl:p-14">
      <span className="absolute -right-32 -bottom-32 w-[520px] h-[520px] rounded-full border border-mint/15" />
      <span className="absolute -right-12 -bottom-12 w-[360px] h-[360px] rounded-full bg-forest-soft" />

      <div className="relative max-w-sm">
        <h2 className="font-display text-white text-[2.4rem] leading-[1.08] tracking-[-0.02em]">
          {heading}
        </h2>
        <ul className="mt-8 space-y-3.5">
          {POINTS.map((point) => (
            <li key={point} className="flex items-center gap-3 text-white/80">
              <span className="w-6 h-6 rounded-full bg-mint/15 flex items-center justify-center shrink-0">
                <Check size={14} className="text-mint" strokeWidth={2.5} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-end justify-between gap-8 mt-12">
        <ul className="flex flex-wrap gap-3 max-w-[180px] pb-2">
          {MARKETING_PLATFORMS.map((platform) => (
            <li
              key={platform.name}
              title={platform.name}
              className="w-10 h-10 rounded-xl bg-white/[0.07] flex items-center justify-center"
            >
              <platform.icon size={18} className="text-white/80" aria-label={platform.name} />
            </li>
          ))}
        </ul>
        <PhoneMockup
          src={screen}
          alt={screenAlt}
          priority
          className="w-[230px] xl:w-[250px] shrink-0 -mb-28 rotate-[-4deg] animate-float-slow"
        />
      </div>
    </aside>
  );
}
