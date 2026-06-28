import Link from "next/link";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Music2,
  Share2,
} from "lucide-react";

const TILES = [
  { icon: Facebook },
  { icon: Instagram },
  { icon: Twitter },
  { icon: Linkedin },
  { compose: true },
  { icon: Youtube },
  { icon: Music2 },
  { icon: MessageCircle },
  { icon: Send },
];

export default function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-5 md:px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-12 items-center">
        <div>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white mb-6 animate-fade-in-up">
            Write once.
            <br />
            Post everywhere.
          </h1>
          <p className="text-neutral-400 text-base md:text-lg max-w-md mb-9 leading-relaxed animate-fade-in-up delay-100">
            Publish to all your social platforms from one place. Schedule
            posts, manage accounts, and track performance from a single
            dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in-up delay-200">
            <Link
              href="/signup"
              className="group flex items-center justify-center gap-2 bg-green-500 text-white font-medium px-6 py-3 rounded-xl hover:bg-green-600 transition-colors duration-200 text-sm"
            >
              Start for free
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="text-center text-neutral-200 hover:text-white font-medium text-sm px-6 py-3 rounded-xl border border-white/10 hover:border-white/25 transition-colors duration-200"
            >
              Learn more
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm w-full mx-auto md:ml-auto md:mr-0 animate-fade-in-up delay-200">
          {TILES.map((tile, i) =>
            tile.compose ? (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/[0.05] border border-white/[0.08] flex flex-col items-center justify-center gap-2 relative"
              >
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-green-400" />
                <Share2 size={22} className="text-white" />
              </div>
            ) : (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center hover:border-white/[0.14] transition-colors duration-200"
              >
                <tile.icon size={24} className="text-neutral-300" />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
