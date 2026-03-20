"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Platforms", href: "#platforms" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-neutral-800/50">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center">
            <Zap size={14} className="text-black" />
          </div>
          <span className="text-white font-semibold text-sm">Cross-Post</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-neutral-400 hover:text-white text-[13px] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/signin"
            className="text-neutral-400 hover:text-white text-[13px] px-4 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black text-[13px] font-medium px-4 py-1.5 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-neutral-400"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-neutral-800/50 px-6 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-neutral-400 hover:text-white text-sm py-2.5"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3 pt-3 border-t border-neutral-800/50">
            <Link href="/signin" className="flex-1 text-center text-neutral-400 text-sm py-2">
              Sign In
            </Link>
            <Link href="/signup" className="flex-1 text-center bg-white text-black text-sm font-medium py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
