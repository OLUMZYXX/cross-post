import Link from "next/link";
import { SUPPORT_EMAIL } from "@/config/marketing";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Support", href: "/support" },
      { label: "Sign in", href: "/signin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-forest text-white px-4 md:px-6 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Cross-Post" className="w-9 h-9 rounded-lg" />
              <span className="font-display text-lg font-semibold">Cross-Post</span>
            </Link>
            <p className="text-white/60 mt-4 max-w-xs leading-relaxed">
              Write it once, post it everywhere.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block mt-5 text-mint hover:text-white transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-white/45 text-sm mb-4">{column.title}</p>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/85 hover:text-mint transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-white/45">
          <p>&copy; {new Date().getFullYear()} Cross-Post. All rights reserved.</p>
          <p>cross-post.xyz</p>
        </div>
      </div>
    </footer>
  );
}
