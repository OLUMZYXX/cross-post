import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageShell({ eyebrow, title, intro, children }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 md:px-6 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-300 text-sm mb-8 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {eyebrow ? (
          <p className="text-green-400 text-xs font-semibold tracking-[0.15em] uppercase mb-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
          {title}
        </h1>
        {intro ? (
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-12 max-w-2xl">
            {intro}
          </p>
        ) : null}

        {children}

        <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/features" className="text-neutral-400 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="/how-it-works" className="text-neutral-400 hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/support" className="text-neutral-400 hover:text-white transition-colors">
            Support
          </Link>
          <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </div>
  );
}
