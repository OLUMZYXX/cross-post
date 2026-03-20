"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function TopBar({ unreadCount = 0 }) {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <header className="h-16 border-b border-neutral-800/50 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="flex items-center flex-1">
        <div className="relative max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
          <input
            type="text"
            placeholder="Search posts..."
            className="w-full bg-neutral-900 border border-neutral-800/50 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-neutral-700 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/notifications"
          className="relative w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800/50 flex items-center justify-center hover:border-neutral-700 transition-all"
        >
          <Bell size={16} className="text-neutral-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 text-black text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        <div className="h-8 w-px bg-neutral-800" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <span className="block text-sm font-semibold text-white leading-none">{user?.name?.split(" ")[0] || "User"}</span>
            <span className="text-[10px] text-neutral-500 font-medium">Creator</span>
          </div>
          <Link
            href="/settings/profile"
            className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 text-xs font-semibold hover:bg-neutral-700 transition-colors border-2 border-neutral-900 ring-2 ring-neutral-800"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
