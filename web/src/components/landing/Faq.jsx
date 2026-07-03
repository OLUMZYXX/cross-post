"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    question: "How much does it cost?",
    answer:
      "Cross-Post is free to start. Connect your platforms, publish posts, schedule, and use AI rephrase at no cost. No credit card required.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram. We're always adding more.",
  },
  {
    question: "Can I schedule posts for later?",
    answer:
      "Yes. Set a date and time for any post and Cross-Post publishes it automatically. You can also bulk-schedule multiple posts at once.",
  },
  {
    question: "How does AI rephrase work?",
    answer:
      "Write your caption once, then rewrite it in different tones — casual, professional, funny, or concise — optimized for each platform's audience.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use encrypted OAuth tokens, two-factor authentication, and never store your platform passwords.",
  },
  {
    question: "Can I delete my account?",
    answer:
      "Any time. Go to Settings → Delete Account and your account, posts, and connected platforms are permanently removed.",
  },
];

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-white/[0.07]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="text-white text-base md:text-lg font-semibold group-hover:text-green-300 transition-colors duration-200">
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 ${
            isOpen ? "rotate-45 bg-green-500/10 border-green-500/30" : "group-hover:border-white/25"
          }`}
        >
          <Plus
            size={14}
            className={isOpen ? "text-green-400" : "text-neutral-400"}
          />
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-neutral-400 text-[15px] leading-relaxed max-w-2xl">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="py-24 md:py-36 px-5 md:px-6 border-t border-white/[0.06] bg-white/[0.015]">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-[1fr_1.6fr] gap-10 lg:gap-20">
        <div>
          <p className="text-green-400 text-sm font-semibold tracking-[0.15em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Frequently asked questions
          </h2>
          <p className="text-neutral-400 text-base">
            Everything you need to know about Cross-Post. Can&apos;t find your
            answer?{" "}
            <a href="/support" className="text-green-400 hover:text-green-300 transition-colors">
              Contact support
            </a>
            .
          </p>
        </div>

        <div className="border-t border-white/[0.07]">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
