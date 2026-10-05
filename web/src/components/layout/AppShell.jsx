"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import useUnreadCount from "@/hooks/useUnreadCount";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import Spinner from "@/components/ui/Spinner";

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const unreadCount = useUnreadCount(Boolean(user));

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="app min-h-screen flex items-center justify-center">
        <Spinner size={26} />
      </div>
    );
  }

  return (
    <div className="app min-h-screen flex">
      <Sidebar unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <TopBar unreadCount={unreadCount} />
        <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-32 lg:pb-12 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
