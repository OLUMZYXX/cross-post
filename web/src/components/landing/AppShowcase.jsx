"use client";

import { useEffect } from "react";
import Reveal from "@/components/ui/Reveal";
import PhoneMockup from "@/components/ui/PhoneMockup";
import SectionHeading from "@/components/landing/SectionHeading";
import useAutoCycle from "@/hooks/useAutoCycle";

const CYCLE_MS = 5000;

const SCREENS = [
  {
    title: "Compose once",
    body: "Write your caption, add photos or video, and tap the platforms it should go to.",
    src: "/images/app/compose.webp",
    alt: "Compose screen with a draft post and four platforms selected",
  },
  {
    title: "Tailored for each platform",
    body: "AI fits one caption to every network's limit and style. Edit anything before it goes out.",
    src: "/images/app/ai-tailor.webp",
    alt: "Tailored captions for Twitter, Instagram and LinkedIn",
  },
  {
    title: "Post now or schedule",
    body: "Publish straight away, or pick a day and time and let Cross-Post handle it.",
    src: "/images/app/schedule.webp",
    alt: "Scheduling sheet with Post Now and a time picker",
  },
  {
    title: "Connect in a tap",
    body: "Add Twitter, Instagram, Facebook, LinkedIn, TikTok, YouTube and more through their official sign-in.",
    src: "/images/app/connect.webp",
    alt: "Add a platform sheet listing social networks",
  },
  {
    title: "Day or night",
    body: "A dark mode that follows your phone's setting, so late-night posting is easy on the eyes.",
    src: "/images/app/dark-mode.webp",
    alt: "Compose screen in dark mode",
  },
];

function ScreenOption({ screen, index, isActive, paused, onSelect }) {
  return (
    <li>
      <button
        onClick={() => onSelect(index)}
        aria-pressed={isActive}
        className={`w-full text-left rounded-2xl px-5 py-4 transition-colors ${
          isActive ? "bg-white shadow-[0_8px_24px_-12px_rgba(2,44,34,0.25)]" : "hover:bg-white/50"
        }`}
      >
        <span className={`font-display text-xl ${isActive ? "text-ink" : "text-ink-soft"}`}>
          {screen.title}
        </span>
        <span
          className={`grid transition-all duration-500 ${
            isActive ? "grid-rows-[1fr] opacity-100 mt-1.5" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <span className="overflow-hidden text-ink-soft leading-relaxed">{screen.body}</span>
        </span>
        {isActive ? (
          <span className="mt-4 block h-0.5 rounded-full bg-line overflow-hidden">
            <span
              key={`${index}-${paused}`}
              className="block h-full bg-leaf origin-left"
              style={{
                animation: paused ? "none" : `progress-fill ${CYCLE_MS}ms linear forwards`,
                transform: paused ? "scaleX(1)" : undefined,
              }}
            />
          </span>
        ) : null}
      </button>
    </li>
  );
}

export default function AppShowcase() {
  const { activeIndex, paused, select, pause, resume } = useAutoCycle(SCREENS.length, CYCLE_MS);
  const active = SCREENS[activeIndex];

  useEffect(() => {
    SCREENS.forEach((screen) => {
      const image = new Image();
      image.src = screen.src;
    });
  }, []);

  return (
    <section id="app" className="bg-sand px-4 md:px-6 py-24 md:py-32 overflow-hidden">
      <div
        className="max-w-[1200px] mx-auto grid lg:grid-cols-[1fr_0.9fr] gap-14 lg:gap-20 items-center"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        <div>
          <Reveal>
            <SectionHeading
              eyebrow="Inside the app"
              title="Everything happens on your phone."
              intro="Cross-Post is built for posting on the go. Here's what it looks like."
            />
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-10 space-y-1.5">
              {SCREENS.map((screen, index) => (
                <ScreenOption
                  key={screen.title}
                  screen={screen}
                  index={index}
                  isActive={index === activeIndex}
                  paused={paused}
                  onSelect={select}
                />
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={150} className="relative flex justify-center">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] max-w-[520px] aspect-square rounded-full bg-forest" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[390px] aspect-square rounded-full border border-mint/30" />
          <PhoneMockup
            src={active.src}
            alt={active.alt}
            screenKey={active.src}
            className="relative w-[250px] sm:w-[290px]"
          />
        </Reveal>
      </div>
    </section>
  );
}
