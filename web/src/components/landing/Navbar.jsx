"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Cross-Post"
            className="w-8 h-8 rounded-lg"
          />
          <span className="text-white font-semibold text-[15px] tracking-tight">
            Cross-Post
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-neutral-400 hover:text-white text-sm transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/signin"
            className="text-neutral-400 hover:text-white text-sm px-4 py-2 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-green-600 transition-colors duration-200"
          >
            Start your free trial
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-neutral-400 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/[0.06] px-5 py-4 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-neutral-400 hover:text-white text-sm py-2.5 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2.5 mt-3 pt-4 border-t border-white/[0.06]">
            <Link
              href="/signin"
              className="flex-1 text-center text-neutral-300 text-sm py-2.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center bg-green-500 text-white text-sm font-medium py-2.5 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
