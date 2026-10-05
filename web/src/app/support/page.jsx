import { Mail } from "lucide-react";
import PageShell from "@/components/marketing/PageShell";
import { SUPPORT_EMAIL } from "@/config/marketing";

const FAQS = [
  {
    question: "How do I connect a social media account?",
    answer:
      "Open the app, go to Home, tap 'Add More' under Connected Platforms, and choose the platform you want to authorize.",
  },
  {
    question: "How do I create and publish a post?",
    answer:
      "Tap the + button in the bottom navigation, write your caption, select the platforms you want, then choose 'Post Now' or 'Schedule for Later'.",
  },
  {
    question: "How do I delete my account?",
    answer:
      "Go to Settings and tap 'Delete Account'. Confirm the prompt to permanently remove your account, posts, and connected accounts. This cannot be undone.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use encrypted OAuth tokens for platform access and never store your social media passwords.",
  },
  {
    question: "How much does Cross-Post cost?",
    answer:
      "The core features are free to use. Cross-Post Pro is an optional subscription that unlocks Twitter/X posting and the advanced features, and it can be managed or cancelled at any time from your App Store or Google Play account.",
  },
  {
    question: "Which platforms can I publish to?",
    answer:
      "Twitter/X, Instagram, Facebook, LinkedIn, TikTok, YouTube, Reddit and Telegram. You can connect more than one account on the same platform and choose which ones receive each post.",
  },
  {
    question: "Why did a post fail on one platform but work on others?",
    answer:
      "Each platform has its own rules and limits, so one can reject a post while the rest succeed. Common reasons are a caption that is too long, a platform that does not accept the media type, an expired connection, or the platform rate limiting posts. Open the post to see the exact reason and retry just that platform.",
  },
  {
    question: "Can I schedule posts in advance?",
    answer:
      "Yes. Choose 'Schedule for Later' when publishing, pick a date and time, and Cross-Post sends the post for you. Scheduled posts are listed separately so you can see what is queued.",
  },
];

export const metadata = {
  title: "Support — Cross-Post",
  description: "Get help with Cross-Post. Find answers to common questions or contact our support team.",
};

export default function SupportPage() {
  return (
    <PageShell
      eyebrow="Support"
      title="How can we help?"
      intro="Find answers to common questions below, or email us directly."
    >
      <div className="rounded-3xl bg-forest p-7 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="font-display text-white text-2xl font-semibold">Contact us</h2>
          <p className="text-white/70 mt-2">Account, billing, or a post that didn&apos;t go out, we can help.</p>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center justify-center gap-2 bg-mint text-forest px-6 py-3.5 rounded-full font-semibold hover:bg-white transition-colors break-all"
        >
          <Mail size={17} className="shrink-0" />
          {SUPPORT_EMAIL}
        </a>
      </div>

      <h2 className="font-display text-ink text-2xl font-semibold mt-16 mb-2">
        Frequently asked questions
      </h2>
      <div className="border-t border-line mt-6">
        {FAQS.map((faq) => (
          <div key={faq.question} className="py-6 border-b border-line">
            <h3 className="text-ink text-lg font-medium">{faq.question}</h3>
            <p className="text-ink-soft leading-relaxed mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
