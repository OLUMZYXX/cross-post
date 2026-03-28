"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PenSquare,
  Send,
  BarChart3,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Create", href: "/create", icon: PenSquare },
  { label: "Posts", href: "/posts", icon: Send },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-2xl border-t border-white/[0.04]">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href === "/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isCreate
                  ? "text-black bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 -mt-3 shadow-lg shadow-green-500/20"
                  : isActive
                    ? "text-green-400"
                    : "text-neutral-600"
              }`}
            >
              <item.icon size={18} />
              {!isCreate && (
                <span className="text-[9px] font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
