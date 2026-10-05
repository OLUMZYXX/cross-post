"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/config/marketing";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-md border-b border-line/70">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <img src="/logo.png" alt="Cross-Post" className="w-8 h-8 rounded-lg" />
          <span className="font-display text-ink font-semibold text-[17px] tracking-tight">
            Cross-Post
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-ink-soft hover:text-ink text-[15px] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/signin"
            className="text-ink-soft hover:text-ink text-[15px] px-4 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-forest text-white text-[15px] font-medium px-5 py-2.5 rounded-full hover:bg-forest-soft transition-colors"
          >
            Get started
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-ink p-2 -mr-2"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-line bg-paper px-4 pb-5 pt-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block text-ink text-base py-3 border-b border-line/60"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 mt-5">
            <Link
              href="/signin"
              onClick={closeMenu}
              className="flex-1 text-center text-ink text-sm font-medium py-3 rounded-full border border-line"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={closeMenu}
              className="flex-1 text-center bg-forest text-white text-sm font-medium py-3 rounded-full"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
