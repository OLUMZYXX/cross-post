"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle, AlertCircle } from "lucide-react";
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
        if (p.name === "Facebook" && p.pages?.length > 0 && p.selectedPageIds?.length > 0) {
          for (const page of p.pages.filter((pg) => p.selectedPageIds.includes(pg.pageId))) {
            expanded.push({ ...p, _id: `${p._id}_page_${page.pageId}`, platformUsername: page.pageName, _pageId: page.pageId });
          }
        } else {
          expanded.push(p);
        }
      }
      setPlatforms(expanded);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPlatforms(); }, [fetchPlatforms]);

  const handleDisconnect = async (platform) => {
    try {
      if (platform._pageId) await platformAPI.toggleFacebookPage(platform._pageId, false);
      else await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((p) => p._id !== platform._id));
      showToast({ type: "success", title: `${platform.platformUsername || platform.name} disconnected` });
    } catch (err) {
      showToast({ type: "error", title: err.message || "Failed to disconnect" });
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
        const popup = window.open(authUrl, `connect_${name}`, "width=600,height=700");
        const timer = setInterval(() => {
          if (popup?.closed) { clearInterval(timer); setConnecting(null); fetchPlatforms(); }
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
    (key) => !connectedNames.has(key.charAt(0).toUpperCase() + key.slice(1))
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/settings" className="text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-headline">Connected Accounts</h1>
          </div>
          <p className="text-neutral-500 max-w-lg">Manage your digital footprint across platforms. Add, remove, or re-authenticate your social profiles from a single hub.</p>
        </div>
        <button
          onClick={() => {
            const first = available[0];
            if (first) handleConnect(first.charAt(0).toUpperCase() + first.slice(1));
          }}
          disabled={available.length === 0}
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-black px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all text-sm flex-shrink-0 disabled:opacity-50"
        >
          <Plus size={16} />
          Add New Account
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platforms.map((p) => (
              <AccountCard key={p._id} platform={p} onDisconnect={handleDisconnect} />
            ))}
            {available.map((key) => {
              const config = PLATFORM_CONFIG[key];
              const name = key.charAt(0).toUpperCase() + key.slice(1);
              return (
                <button
                  key={key}
                  onClick={() => handleConnect(name)}
                  disabled={connecting === name}
                  className="bg-neutral-900/30 rounded-2xl p-6 border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-neutral-900 hover:border-green-500/30 transition-all min-h-[180px]"
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform" style={{ color: config.color }}>
                    <span className="text-lg font-bold">{name[0]}</span>
                  </div>
                  <p className="font-bold text-white text-sm">Connect {config.label}</p>
                  <p className="text-xs text-neutral-500 mt-1">Unlock cross-posting</p>
                  {connecting === name && <Spinner size={14} className="mt-2" />}
                </button>
              );
            })}
          </div>

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
      <h3 className="text-lg font-bold text-white mb-4 font-headline">Recent Connection Logs</h3>
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800/50 p-2">
        <div className="divide-y divide-neutral-800/30">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 p-4 hover:bg-neutral-800/30 transition-colors rounded-xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                log.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
              }`}>
                {log.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{log.name} successfully synchronized</p>
                <p className="text-xs text-neutral-500">{log.name} successfully synchronized at {log.username}.</p>
              </div>
              <span className="text-[10px] font-bold text-neutral-600 uppercase flex-shrink-0">Recently</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
