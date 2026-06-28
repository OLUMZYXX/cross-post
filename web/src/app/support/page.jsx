import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

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
      "Cross-Post is completely free to use. There are no subscriptions or in-app purchases.",
  },
];

export const metadata = {
  title: "Support — Cross-Post",
  description: "Get help with Cross-Post. Find answers to common questions or contact our support team.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm mb-8 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Support
        </h1>
        <p className="text-neutral-400 text-sm md:text-base mb-10">
          Need help with Cross-Post? Find answers below or reach out to us directly.
        </p>

        <div className="glass gradient-border bg-white/[0.03] rounded-2xl p-5 md:p-7 mb-10">
          <h2 className="text-white text-lg font-bold mb-2">Contact us</h2>
          <p className="text-neutral-400 text-sm mb-4">
            Email our support team and we'll get back to you as soon as possible.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-200 transition-all duration-200"
          >
            <Mail size={16} />
            {SUPPORT_EMAIL}
          </a>
        </div>

        <h2 className="text-white text-lg font-bold mb-4">Frequently asked questions</h2>
        <div className="space-y-3 md:space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass rounded-xl md:rounded-2xl p-4 md:p-6">
              <h3 className="text-white text-sm md:text-[15px] font-semibold mb-1.5 md:mb-2">
                {faq.question}
              </h3>
              <p className="text-neutral-500 text-xs md:text-sm leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-12 text-sm">
          <Link href="/privacy" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-neutral-500 hover:text-neutral-300 transition-colors duration-200">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
