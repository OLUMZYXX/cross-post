"use client";

import Link from "next/link";
import { User, Link2, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import usePostsData from "@/hooks/usePostsData";

const SECTIONS = [
  {
    label: "Account",
    items: [
      { label: "Edit Profile", desc: "Name and email", href: "/settings/profile", icon: User },
      { label: "Connected Accounts", desc: "Manage linked platforms", href: "/settings/accounts", icon: Link2, showCount: true },
      { label: "Notifications", desc: "Alert preferences", href: "/settings/notifications", icon: Bell },
    ],
  },
  {
    label: "General",
    items: [
      { label: "Privacy & Security", desc: "Password, 2FA", href: "/settings/security", icon: Shield },
      { label: "Help & Support", desc: "FAQs, contact", href: "#", icon: HelpCircle },
    ],
  },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { platforms } = usePostsData();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline mb-5">Settings</h1>

      <Link href="/settings/profile" className="flex items-center gap-3 glass rounded-2xl p-4 mb-5 hover:border-white/[0.1] transition-all duration-200">
        <div className="w-12 h-12 rounded-lg bg-white/[0.06] flex items-center justify-center text-neutral-300 text-sm font-medium">
          {initials}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">{user?.name || "User"}</p>
          <p className="text-neutral-500 text-xs">{user?.email || ""}</p>
        </div>
        <ChevronRight size={16} className="text-neutral-600" />
      </Link>

      {SECTIONS.map((section) => (
        <div key={section.label} className="mb-4">
          <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-2 ml-1">{section.label}</p>
          <div className="glass rounded-2xl overflow-hidden">
            {section.items.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-all duration-200 ${
                  i < section.items.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <item.icon size={15} className="text-neutral-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-neutral-600 text-[11px]">{item.desc}</p>
                </div>
                {item.showCount && (
                  <span className="text-neutral-500 text-[11px] bg-white/[0.06] rounded-full px-2 py-0.5 mr-1">
                    {platforms.length}
                  </span>
                )}
                <ChevronRight size={14} className="text-neutral-700" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 w-full glass rounded-2xl py-3 text-red-400 text-sm hover:bg-red-500/5 hover:border-red-500/20 transition-all duration-200"
      >
        <LogOut size={15} />
        Sign Out
      </button>

      <p className="text-center text-neutral-700 text-[10px] mt-4">Cross-Post v1.0.0</p>
    </div>
  );
}
