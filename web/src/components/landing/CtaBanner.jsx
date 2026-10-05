import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

export default function CtaBanner() {
  return (
    <section className="px-4 md:px-6 pb-24 md:pb-32">
      <Reveal variant="scale" className="relative max-w-[1200px] mx-auto rounded-[32px] overflow-hidden bg-forest">
        <img
          src="/images/cta-friends.webp"
          alt="Two friends reacting with excitement to a post on a phone"
          className="absolute inset-0 w-full h-full object-cover object-[80%_35%]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/85 to-forest/10" />

        <div className="relative px-7 py-16 md:px-14 md:py-24 max-w-xl">
          <h2 className="font-display text-white text-[2.25rem] md:text-5xl leading-[1.05] font-medium tracking-[-0.02em]">
            Your next post could already be everywhere.
          </h2>
          <p className="text-white/75 text-lg mt-5">
            Set up takes a couple of minutes. Free to start, with 7 days of Pro on us.
          </p>
          <Link
            href="/signup"
            className="group mt-9 inline-flex items-center gap-2 bg-mint text-forest font-semibold px-7 py-4 rounded-full hover:bg-white transition-colors"
          >
            Create your free account
            <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
