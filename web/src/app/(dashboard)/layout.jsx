"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { notificationAPI } from "@/services/notificationService";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import Spinner from "@/components/ui/Spinner";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push("/signin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const { data } = await notificationAPI.list();
        setUnreadCount(data.unreadCount || 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 120000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar unreadCount={unreadCount} />
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-8 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
