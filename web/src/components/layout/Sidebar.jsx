"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Wordmark from "@/components/app/Wordmark";
import {
  APP_NAV,
  SIDEBAR_SECONDARY,
  BRAND_TAGLINE,
  isActivePath,
  userInitials,
} from "@/config/appNav";

function NavLink({ item, active, badge }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[15px] border transition-colors duration-150 ${
        active
          ? "bg-cp-card border-cp-rule text-cp-ink font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          : "border-transparent text-cp-muted hover:text-cp-ink hover:bg-cp-deep"
      }`}
    >
      <item.icon size={19} strokeWidth={active ? 2.3 : 1.8} />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-cp-accent text-white text-[11px] font-bold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export default function Sidebar({ unreadCount = 0 }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[272px] shrink-0 h-screen sticky top-0 border-r border-cp-rule px-4 py-6">
      <div className="px-2">
        <Wordmark />
        <p className="text-cp-muted text-[13px] leading-snug mt-2.5 pr-4">{BRAND_TAGLINE}</p>
      </div>

      <Link
        href="/create"
        className="cp-chunky mt-7 mx-1 flex items-center justify-center gap-2 bg-cp-accent text-white font-semibold text-[15px] py-3 rounded-2xl"
      >
        <Plus size={18} strokeWidth={2.5} />
        New post
      </Link>

      <nav className="mt-7 space-y-1" aria-label="Main">
        {APP_NAV.map((item) => (
          <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-6 pt-6 border-t border-cp-rule space-y-1">
        {SIDEBAR_SECONDARY.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
            badge={unreadCount}
          />
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 rounded-2xl bg-cp-card border border-cp-rule p-3">
        <span className="w-10 h-10 rounded-full bg-cp-ink text-cp-card text-sm font-bold flex items-center justify-center shrink-0">
          {userInitials(user?.name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-cp-ink text-sm font-semibold truncate">{user?.name || "Your account"}</p>
          <p className="text-cp-soft text-xs truncate">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
          className="w-9 h-9 rounded-full flex items-center justify-center text-cp-muted hover:text-cp-accent hover:bg-cp-deep transition-colors"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
