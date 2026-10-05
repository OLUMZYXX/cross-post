import Link from "next/link";

export default function NotFound() {
  return (
    <div className="site min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <img src="/logo.png" alt="Cross-Post" className="w-12 h-12 rounded-xl mx-auto mb-8" />
        <p className="font-display text-ink text-6xl font-semibold tracking-tight">404</p>
        <p className="text-ink-soft text-lg mt-3 mb-8">This page didn&apos;t make it to the feed.</p>
        <Link
          href="/"
          className="inline-block bg-forest text-white font-medium px-6 py-3 rounded-full hover:bg-forest-soft transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
