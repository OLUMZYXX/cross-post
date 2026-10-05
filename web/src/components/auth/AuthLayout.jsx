import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthShowcase from "@/components/auth/AuthShowcase";

export default function AuthLayout({ title, subtitle, showcase, footer, children }) {
  return (
    <div className="site min-h-screen p-3 sm:p-4 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-4">
      <main className="min-h-[calc(100vh-1.5rem)] sm:min-h-[calc(100vh-2rem)] flex flex-col px-3 sm:px-8 xl:px-16">
        <header className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Cross-Post" className="w-9 h-9 rounded-lg" />
            <span className="font-display text-ink font-semibold text-lg">Cross-Post</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-ink-soft hover:text-ink text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            Back to site
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[420px] animate-fade-in-up">
            <h1 className="font-display text-ink text-[2.5rem] sm:text-5xl leading-[1.05] tracking-[-0.025em]">
              {title}
            </h1>
            <p className="text-ink-soft text-lg mt-3">{subtitle}</p>
            <div className="mt-10">{children}</div>
            <div className="mt-8 text-center text-ink-soft">{footer}</div>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 py-4 text-sm text-ink-muted">
          <span>&copy; {new Date().getFullYear()} Cross-Post</span>
          <Link href="/terms" className="hover:text-ink transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            Privacy
          </Link>
          <Link href="/support" className="hover:text-ink transition-colors">
            Help
          </Link>
        </footer>
      </main>

      <AuthShowcase {...showcase} />
    </div>
  );
}
