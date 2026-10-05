"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { platformAPI } from "@/services/platformService";
import { useToast } from "@/context/ToastContext";
import { expandPlatforms } from "@/utils/platforms";

const POPUP_POLL_MS = 1000;

export default function useConnectedAccounts() {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const pollRef = useRef(null);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    try {
      const { data } = await platformAPI.list();
      setPlatforms(expandPlatforms(data?.platforms || []));
    } catch {
      showToast({ type: "error", title: "Couldn't load your accounts" });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
    return () => clearInterval(pollRef.current);
  }, [load]);

  const connect = async (platform) => {
    setConnecting(platform.name);
    try {
      const { data } = await platform.start();
      const authUrl = data?.authUrl || data?.url;
      if (!authUrl) throw new Error(`Couldn't start ${platform.label} sign-in`);
      const popup = window.open(authUrl, `connect_${platform.name}`, "width=600,height=720");
      if (!popup) {
        setConnecting(null);
        showToast({ type: "info", title: "Allow pop-ups for this site, then try again" });
        return;
      }
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollRef.current);
          setConnecting(null);
          load();
        }
      }, POPUP_POLL_MS);
    } catch (error) {
      setConnecting(null);
      showToast({ type: "error", title: error.message || "Connection failed" });
    }
  };

  const connectTelegram = async (botToken, channelId) => {
    setConnecting("Telegram");
    try {
      await platformAPI.connectTelegram(botToken.trim(), channelId.trim());
      showToast({ type: "success", title: "Telegram connected" });
      await load();
      return true;
    } catch (error) {
      showToast({ type: "error", title: error.message || "Couldn't connect Telegram" });
      return false;
    } finally {
      setConnecting(null);
    }
  };

  const disconnect = async (platform) => {
    try {
      if (platform._pageId) await platformAPI.toggleFacebookPage(platform._pageId, false);
      else await platformAPI.disconnect(platform._id);
      setPlatforms((prev) => prev.filter((entry) => entry._id !== platform._id));
      showToast({ type: "success", title: `${platform.platformUsername || platform.name} disconnected` });
    } catch (error) {
      showToast({ type: "error", title: error.message || "Couldn't disconnect" });
    }
  };

  return { platforms, loading, connecting, connect, connectTelegram, disconnect };
}
