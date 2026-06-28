const FAQS = [
  {
    question: "How much does it cost?",
    answer:
      "Cross-Post is completely free. Connect your platforms, publish unlimited posts, schedule, and use AI rephrase at no cost. No credit card required.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "Cross-Post supports Facebook, Instagram, TikTok, Twitter/X, LinkedIn, YouTube, Reddit, and Telegram. We're always adding more.",
  },
  {
    question: "Can I schedule posts for later?",
    answer:
      "Absolutely. Set a date and time for any post and Cross-Post will publish it automatically. You can also bulk-schedule multiple posts at once.",
  },
  {
    question: "How does AI rephrase work?",
    answer:
      "Write your caption once, then use AI to rewrite it in different tones — casual, professional, funny, or concise — optimized for each platform's audience.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use encrypted OAuth tokens for platform access, two-factor authentication for your account, and never store your platform passwords.",
  },
  {
    question: "Are there any paid upgrades?",
    answer:
      "No. Every feature is included for free with no contracts, commitments, or subscriptions. You can delete your account at any time from Settings.",
  },
];

export default function Faq() {
  return (
    <section className="py-14 md:py-24 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-2 md:mb-4 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-neutral-400 text-xs md:text-base">
            Everything you need to know
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`glass rounded-xl md:rounded-2xl p-4 md:p-6 animate-fade-in-up delay-${((i % 5) + 1) * 100}`}
            >
              <h3 className="text-white text-xs md:text-[15px] font-semibold mb-1.5 md:mb-2">
                {faq.question}
              </h3>
              <p className="text-neutral-500 text-[11px] md:text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
