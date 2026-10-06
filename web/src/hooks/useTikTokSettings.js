"use client";

import { useRef, useState } from "react";
import { platformAPI } from "@/services/platformService";
import {
  EMPTY_TIKTOK_SETTINGS,
  isTikTokIdentifier,
  isVideoMediaUrl,
  tiktokSettingsProblem,
} from "@/config/tiktok";

export default function useTikTokSettings({ selectedPlatforms, mediaUrls }) {
  const [visible, setVisible] = useState(false);
  const [creator, setCreator] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [settings, setSettings] = useState(EMPTY_TIKTOK_SETTINGS);
  const [confirmed, setConfirmed] = useState(null);
  const onDoneRef = useRef(null);

  const tiktokIdentifier = selectedPlatforms.find(isTikTokIdentifier);
  const needsSettings = Boolean(tiktokIdentifier) && mediaUrls.length > 0;
  const isVideo = mediaUrls.some(isVideoMediaUrl);

  const loadCreator = async () => {
    setCreator(null);
    setLoadError(null);
    try {
      const { data } = await platformAPI.getTikTokCreatorInfo(tiktokIdentifier?.split(":")[1]);
      setCreator(data?.creator || null);
    } catch (error) {
      setLoadError(error.message || "Couldn't load your TikTok account. Try again.");
    }
  };

  const open = (onDone) => {
    onDoneRef.current = onDone;
    setSettings(EMPTY_TIKTOK_SETTINGS);
    setConfirmed(null);
    setVisible(true);
    loadCreator();
  };

  const update = (changes) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      if (!next.discloseContent) {
        next.yourBrand = false;
        next.brandedContent = false;
      }
      if (next.brandedContent && next.privacyLevel === "SELF_ONLY") next.privacyLevel = null;
      return next;
    });
  };

  const problem = loadError || tiktokSettingsProblem({ settings, creator, isVideo, videoDurationSec: 0 });

  const confirm = () => {
    if (problem) return;
    setConfirmed(settings);
    setVisible(false);
    onDoneRef.current?.(settings);
  };

  const runWithSettings = (action) => (needsSettings ? open(action) : action(null));

  return {
    needsSettings,
    visible,
    creator,
    loadError,
    settings,
    isVideo,
    problem,
    payload: needsSettings ? confirmed : null,
    runWithSettings,
    close: () => setVisible(false),
    retry: loadCreator,
    update,
    confirm,
  };
}
