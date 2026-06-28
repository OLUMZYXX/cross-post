import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalShell({ title, updated, children }) {
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

        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
          {title}
        </h1>
        <p className="text-neutral-500 text-xs md:text-sm mb-10">Last updated: {updated}</p>

        <div className="space-y-6 text-neutral-400 text-sm leading-relaxed [&_h2]:text-white [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-green-400">
          {children}
        </div>
      </div>
    </div>
  );
}
