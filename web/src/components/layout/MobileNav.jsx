"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, PenSquare, Send, BarChart3 } from "lucide-react";

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
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-t border-neutral-800/50">
      <div className="flex items-center justify-around h-14 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isCreate = item.href === "/create";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isCreate
                  ? "text-black bg-green-500 rounded-lg px-4 py-1.5 -mt-2"
                  : isActive
                    ? "text-green-400"
                    : "text-neutral-600"
              }`}
            >
              <item.icon size={18} />
              {!isCreate && <span className="text-[9px]">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
