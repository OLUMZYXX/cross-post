"use client";

import Link from "next/link";
import { User, Link2, Bell, Shield, HelpCircle, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import usePostsData from "@/hooks/usePostsData";
import SettingsGroup, { SettingsRow } from "@/components/settings/SettingsGroup";
import { userInitials } from "@/config/appNav";

const ACCOUNT_ITEMS = [
  { label: "Edit profile", desc: "Your name and email", href: "/settings/profile", icon: User },
  { label: "Connected accounts", desc: "Platforms you post to", href: "/settings/accounts", icon: Link2, showCount: true },
  { label: "Notifications", desc: "What we alert you about", href: "/settings/notifications", icon: Bell },
];

const GENERAL_ITEMS = [
  { label: "Privacy & security", desc: "Two-factor authentication", href: "/settings/security", icon: Shield },
  { label: "Help & support", desc: "Answers and contact", href: "/support", icon: HelpCircle },
  { label: "Terms & privacy", desc: "How we handle your data", href: "/privacy", icon: FileText },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { platforms } = usePostsData();
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : null;

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="sr-only">Profile</h1>
      <p className="cp-eyebrow !text-cp-accent mb-2" aria-hidden="true">Profile</p>
      <Link
        href="/settings/profile"
        className="flex items-center gap-4 rounded-[28px] bg-cp-card border border-cp-rule p-5 hover:bg-cp-deep transition-colors"
      >
        <span className="w-16 h-16 rounded-full bg-cp-ink text-cp-card text-xl font-bold flex items-center justify-center shrink-0">
          {userInitials(user?.name)}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-display text-cp-ink text-2xl font-semibold truncate">{user?.name || "Your account"}</span>
          <span className="block text-cp-muted text-sm truncate">{user?.email}</span>
          {memberSince ? <span className="block text-cp-soft text-xs mt-1">Member since {memberSince}</span> : null}
        </span>
      </Link>

      <SettingsGroup label="Account">
        {ACCOUNT_ITEMS.map((item) => (
          <SettingsRow
            key={item.href}
            item={item}
            trailing={
              item.showCount ? (
                <span className="min-w-6 h-6 px-2 rounded-full bg-cp-ink text-cp-card text-xs font-bold flex items-center justify-center">
                  {platforms.length}
                </span>
              ) : null
            }
          />
        ))}
      </SettingsGroup>

      <SettingsGroup label="General">
        {GENERAL_ITEMS.map((item) => (
          <SettingsRow key={item.href} item={item} />
        ))}
      </SettingsGroup>

      <button
        onClick={logout}
        className="cp-press mt-7 w-full flex items-center justify-center gap-2 rounded-3xl border border-cp-rule bg-cp-card py-4 text-cp-accent font-semibold hover:bg-cp-accent-soft/40 transition-colors"
      >
        <LogOut size={17} />
        Sign out
      </button>
    </div>
  );
}
