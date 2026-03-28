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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
            <Zap size={15} className="text-black" />
          </div>
          <span className="text-white font-bold text-[15px] tracking-tight">
            Cross-Post
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
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

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/signin"
            className="text-neutral-400 hover:text-white text-sm px-4 py-2 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black text-sm font-semibold px-5 py-2 rounded-xl hover:bg-neutral-200 transition-all duration-200 shadow-lg shadow-white/5"
          >
            Get Started
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-neutral-400 hover:text-white transition-colors"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/[0.04] px-6 py-4 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block text-neutral-400 hover:text-white text-sm py-3 transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-3 mt-4 pt-4 border-t border-white/[0.04]">
            <Link
              href="/signin"
              className="flex-1 text-center text-neutral-400 text-sm py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="flex-1 text-center bg-white text-black text-sm font-semibold py-2.5 rounded-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
