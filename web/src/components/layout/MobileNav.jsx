"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { APP_NAV, isActivePath } from "@/config/appNav";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pointer-events-none"
    >
      <div className="flex items-center gap-2.5 max-w-md mx-auto pointer-events-auto">
        <div className="cp-glass flex-1 flex items-center justify-between gap-1 rounded-full border border-cp-rule p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.3)]">
          {APP_NAV.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`cp-press flex items-center justify-center gap-1.5 h-11 rounded-full transition-all duration-200 ${
                  active
                    ? "px-4 bg-cp-ink/[0.07] border border-cp-card/60 text-cp-ink"
                    : "flex-1 text-cp-muted"
                }`}
              >
                <item.icon size={20} strokeWidth={active ? 2.3 : 1.8} />
                {active ? <span className="text-[13px] font-semibold">{item.label}</span> : null}
              </Link>
            );
          })}
        </div>
        <Link
          href="/create"
          aria-label="New post"
          className="cp-press w-14 h-14 shrink-0 rounded-full bg-cp-ink text-cp-card flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(0,0,0,0.5)]"
        >
          <Plus size={24} strokeWidth={2.4} />
        </Link>
      </div>
    </nav>
  );
}
