"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const FAQS = [
  {
    question: "How much does it cost?",
    answer:
      "Cross-Post is free to start. Connect your platforms, publish, schedule and use AI rephrase at no cost. Pro adds posting to Twitter / X and starts with a 7-day free trial.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Instagram, TikTok, Twitter / X, Facebook, LinkedIn, YouTube, Reddit and Telegram. You can connect more than one account on the same platform.",
  },
  {
    question: "Can I schedule posts for later?",
    answer:
      "Yes. Set a date and time for any post and Cross-Post publishes it automatically. Scheduled posts are listed separately so you always know what's queued.",
  },
  {
    question: "How does AI rephrase work?",
    answer:
      "Write your caption once, then rewrite it in a different tone or let Cross-Post tailor it to each platform's length and audience. Your facts stay the same.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Platforms are connected through their official sign-in, tokens are encrypted, and we never see or store your social media passwords.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Any time. Go to Settings, then Delete Account, and your account, posts and connected platforms are permanently removed.",
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-6 py-6 text-left"
      >
        <span className="text-ink text-lg font-medium">{faq.question}</span>
        <Plus
          size={20}
          className={`shrink-0 text-ink-soft transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-ink-soft leading-relaxed max-w-2xl">{faq.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="px-4 md:px-6 py-24 md:py-32 border-t border-line">
      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-20">
        <Reveal>
          <h2 className="font-display text-ink text-[2rem] md:text-[2.75rem] leading-[1.08] font-medium tracking-[-0.02em]">
            Questions, answered.
          </h2>
          <p className="text-ink-soft text-lg mt-5">
            Can&apos;t find what you need?{" "}
            <Link href="/support" className="text-leaf underline underline-offset-4">
              Talk to support
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delay={120} className="border-t border-line">
          {FAQS.map((faq, index) => (
            <FaqItem
              key={faq.question}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
