"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Wordmark from "@/components/app/Wordmark";
import { greetingFor, userInitials } from "@/config/appNav";

export default function TopBar({ unreadCount = 0 }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0];

  return (
    <header className="cp-glass sticky top-0 z-40 border-b border-cp-rule/70">
      <div className="max-w-[1120px] mx-auto h-16 px-4 sm:px-6 lg:px-10 flex items-center justify-between gap-4">
        <div className="lg:hidden">
          <Wordmark />
        </div>
        <p className="hidden lg:block text-cp-muted text-[15px]">
          {greetingFor()}
          {firstName ? (
            <>
              , <span className="text-cp-ink font-semibold">{firstName}</span>
            </>
          ) : null}
        </p>

        <div className="flex items-center gap-2.5">
          <Link
            href="/notifications"
            aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}
            className="cp-press relative w-10 h-10 rounded-full bg-cp-card border border-cp-rule flex items-center justify-center text-cp-ink hover:bg-cp-deep transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-cp-accent text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-cp-paper">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/settings/profile"
            aria-label="Your profile"
            className="cp-press w-10 h-10 rounded-full bg-cp-ink text-cp-card text-[13px] font-bold flex items-center justify-center lg:hidden"
          >
            {userInitials(user?.name)}
          </Link>
        </div>
      </div>
    </header>
  );
}
