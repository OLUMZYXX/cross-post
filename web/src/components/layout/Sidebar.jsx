"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Send,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Plus,
  Share2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const MAIN_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Composer", href: "/create", icon: PenSquare },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Posts", href: "/posts", icon: Send },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const BOTTOM_NAV = [
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const renderLink = (item) => {
    const isActive =
      pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
          isActive
            ? "bg-green-500/10 text-green-400 font-semibold"
            : "text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.03]"
        }`}
      >
        <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-[#0a0a0a] border-r border-white/[0.04] h-screen sticky top-0">
      <div className="px-6 py-6 mb-2">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/15">
            <Share2 size={16} className="text-black" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              Cross-Post
            </span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-600">
              Publish Everywhere
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">{MAIN_NAV.map(renderLink)}</nav>

      <div className="px-3 mt-auto space-y-0.5">
        <Link
          href="/create"
          className="w-full mb-3 py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-black rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/15 hover:shadow-green-500/25 transition-all duration-200 text-sm"
        >
          <Plus size={16} />
          New Post
        </Link>

        {BOTTOM_NAV.map(renderLink)}

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-neutral-500 hover:text-red-400 hover:bg-white/[0.03] transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      <div className="h-4" />
    </aside>
  );
}
