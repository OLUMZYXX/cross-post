"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PenSquare, Send, CalendarDays, BarChart3,
  Bell, Settings, LogOut, Plus, Zap,
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
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
          isActive
            ? "bg-green-500/10 text-green-400 font-semibold"
            : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
        }`}
      >
        <item.icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0a0a0a] border-r border-neutral-800/50 h-screen sticky top-0">
      <div className="px-6 py-6 mb-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Zap size={18} className="text-black" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-green-400">Cross-Post</span>
            <p className="text-[10px] font-medium uppercase tracking-widest text-neutral-600">Publish Everywhere</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {MAIN_NAV.map(renderLink)}
      </nav>

      <div className="px-4 mt-auto space-y-1">
        <Link
          href="/create"
          className="w-full mb-4 py-3 px-4 bg-gradient-to-br from-green-500 to-emerald-600 text-black rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-shadow text-sm"
        >
          <Plus size={18} />
          New Post
        </Link>

        {BOTTOM_NAV.map(renderLink)}

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-neutral-500 hover:text-red-400 hover:bg-neutral-800/50 transition-all"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      <div className="h-4" />
    </aside>
  );
}
