const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Platforms", href: "#platforms" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Support", href: "/support" },
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
    <footer className="border-t border-white/[0.06] px-5 md:px-6 pt-16 pb-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/logo.png" alt="Cross-Post" className="w-7 h-7 rounded-lg" />
              <span className="text-white text-sm font-semibold">Cross-Post</span>
            </div>
            <p className="text-neutral-500 text-sm max-w-[200px]">
              Write once, publish everywhere.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-4">
                {col.title}
              </p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-neutral-400 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/[0.06]">
          <p className="text-neutral-600 text-xs">
            &copy; {new Date().getFullYear()} Cross-Post. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="/terms" className="text-neutral-500 hover:text-white text-xs transition-colors duration-200">
              Terms
            </a>
            <a href="/privacy" className="text-neutral-500 hover:text-white text-xs transition-colors duration-200">
              Privacy
            </a>
            <a href="/support" className="text-neutral-500 hover:text-white text-xs transition-colors duration-200">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
