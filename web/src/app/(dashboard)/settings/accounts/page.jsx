"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { platformAPI } from "@/services/platformService";
import { useToast } from "@/context/ToastContext";
import { PLATFORM_CONFIG } from "@/config/platforms";
import usePostsData from "@/hooks/usePostsData";
import Spinner from "@/components/ui/Spinner";
import AccountCard from "@/components/settings/AccountCard";
import AccountSidebar from "@/components/settings/AccountSidebar";

const OAUTH_METHODS = {
  Facebook: () => platformAPI.initiateFacebookAuth(),
  Twitter: () => platformAPI.initiateTwitterAuth(),
  Instagram: () => platformAPI.initiateInstagramAuth(),
  TikTok: () => platformAPI.initiateTikTokAuth(),
  LinkedIn: () => platformAPI.initiateLinkedInAuth(),
  YouTube: () => platformAPI.initiateYouTubeAuth(),
  Reddit: () => platformAPI.initiateRedditAuth(),
};

export default function AccountsPage() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const { showToast } = useToast();
  const { sentPosts } = usePostsData();

  const fetchPlatforms = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();
      const raw = data.platforms || [];
      const expanded = [];
      for (const p of raw) {
        if (
          p.name === "Facebook" &&
          p.pages?.length > 0 &&
          p.selectedPageIds?.length > 0
        ) {
          for (const page of p.pages.filter((pg) =>
            p.selectedPageIds.includes(pg.pageId),
          )) {
            expanded.push({
              ...p,
              _id: `${p._id}_page_${page.pageId}`,
              platformUsername: page.pageName,
              _pageId: page.pageId,
            });
          }
        } else {
          expanded.push(p);
        }
      }
      setPlatforms(expanded);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const handleDisconnect = async (platform) => {
    try {
      if (platform._pageId)
        await platformAPI.toggleFacebookPage(platform._pageId, false);
      else await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
      showToast({
        type: "success",
        title: `${platform.platformUsername || platform.name} disconnected`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: err.message || "Failed to disconnect",
      });
    }
  };

  const handleConnect = async (name) => {
    const method = OAUTH_METHODS[name];
    if (!method) return;
    setConnecting(name);
    try {
      const { data } = await method();
      const authUrl = data.authUrl || data.url;
      if (authUrl) {
        const popup = window.open(
          authUrl,
          `connect_${name}`,
          "width=600,height=700",
        );
        const timer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(timer);
            setConnecting(null);
            fetchPlatforms();
          }
        }, 1000);
      }
    } catch (err) {
      showToast({ type: "error", title: err.message || "Connection failed" });
      setConnecting(null);
    }
  };

  if (loading) return <Spinner className="py-20" />;

  const connectedNames = new Set(platforms.map((p) => p.name));
  const available = Object.keys(PLATFORM_CONFIG).filter(
    (key) => !connectedNames.has(key.charAt(0).toUpperCase() + key.slice(1)),
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/settings"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-neutral-500 hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <ArrowLeft size={14} className="sm:hidden" />
            <ArrowLeft size={16} className="hidden sm:block" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white font-headline">
              Connected Accounts
            </h1>
            <p className="text-neutral-500 text-[10px] sm:text-xs mt-0.5">
              {platforms.length} connected &middot; {available.length} available
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-4 sm:space-y-6">
          {platforms.length > 0 && (
            <section>
              <p className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">
                Active
              </p>
              <div className="space-y-2 sm:space-y-2.5">
                {platforms.map((p) => (
                  <AccountCard
                    key={p._id}
                    platform={p}
                    onDisconnect={handleDisconnect}
                  />
                ))}
              </div>
            </section>
          )}

          {available.length > 0 && (
            <section>
              <p className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">
                Available
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {available.map((key) => {
                  const config = PLATFORM_CONFIG[key];
                  const name = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <button
                      key={key}
                      onClick={() => handleConnect(name)}
                      disabled={connecting === name}
                      className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 group cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
                    >
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                      >
                        <span className="text-sm sm:text-base font-bold">{name[0]}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs font-semibold text-neutral-300">
                        {config.label}
                      </p>
                      {connecting === name && (
                        <Spinner size={12} className="mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <ConnectionLogs platforms={platforms} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <AccountSidebar platforms={platforms} sentPosts={sentPosts} />
        </div>
      </div>
    </div>
  );
}

function ConnectionLogs({ platforms }) {
  if (platforms.length === 0) return null;
  const logs = platforms.slice(0, 3).map((p) => ({
    name: p.name,
    username: p.platformUsername || p.name,
    success: true,
  }));

  return (
    <section>
      <p className="text-[10px] sm:text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 sm:mb-3">
        Recent Activity
      </p>
      <div className="space-y-1.5 sm:space-y-2">
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 sm:gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3"
          >
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                log.success
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {log.success ? (
                <CheckCircle size={12} className="sm:hidden" />
              ) : (
                <AlertCircle size={12} className="sm:hidden" />
              )}
              {log.success ? (
                <CheckCircle size={14} className="hidden sm:block" />
              ) : (
                <AlertCircle size={14} className="hidden sm:block" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-white truncate">
                {log.name} &middot; @{log.username}
              </p>
            </div>
            <span className="text-[9px] sm:text-[10px] text-green-400/70 font-medium flex-shrink-0">
              Synced
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
  );
}
