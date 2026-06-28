import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Music2,
} from "lucide-react";

const PLATFORMS = [
  { name: "Facebook", icon: Facebook },
  { name: "Instagram", icon: Instagram },
  { name: "Twitter / X", icon: Twitter },
  { name: "TikTok", icon: Music2 },
  { name: "LinkedIn", icon: Linkedin },
  { name: "YouTube", icon: Youtube },
  { name: "Reddit", icon: MessageCircle },
  { name: "Telegram", icon: Send },
];

export default function Platforms() {
  return (
    <section id="platforms" className="py-20 md:py-28 px-5 md:px-6 border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-4">
          Platforms
        </p>
        <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
          Connect once, publish everywhere
        </h2>
        <p className="text-neutral-400 text-base max-w-md mx-auto mb-12">
          Cross-Post supports all the platforms you already use.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 hover:border-white/[0.18] transition-colors duration-200"
            >
              <p.icon size={17} className="text-neutral-300" />
              <span className="text-neutral-300 text-sm font-medium">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
