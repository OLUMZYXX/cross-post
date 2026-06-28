const FAQS = [
  {
    question: "How much does it cost?",
    answer:
      "Cross-Post is completely free. Connect your platforms, publish unlimited posts, schedule, and use AI rephrase at no cost. No credit card required.",
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
    question: "Are there any paid upgrades?",
    answer:
      "No. Every feature is free with no contracts or subscriptions. You can delete your account any time from Settings.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28 px-5 md:px-6 border-t border-white/[0.06] bg-white/[0.015]">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl mb-14 md:mb-16">
          <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-4">
            FAQ
          </p>
          <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            Frequently asked questions
          </h2>
          <p className="text-neutral-400 text-base">
            Everything you need to know about Cross-Post.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <h3 className="text-white text-[15px] font-semibold mb-2.5">
                {faq.question}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
