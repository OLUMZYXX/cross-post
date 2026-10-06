import { useState } from "react";
import { platformAPI } from "../services/api";
import {
  EMPTY_TIKTOK_SETTINGS,
  isTikTokIdentifier,
  tiktokSettingsProblem,
} from "../constants/tiktok";

export default function useTikTokSettings({ selectedPlatforms, selectedMedia, onConfirmed }) {
  const [visible, setVisible] = useState(false);
  const [creator, setCreator] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [settings, setSettings] = useState(EMPTY_TIKTOK_SETTINGS);
  const [confirmed, setConfirmed] = useState(null);

  const tiktokIdentifier = selectedPlatforms.find(isTikTokIdentifier);
  const needsSettings = Boolean(tiktokIdentifier) && selectedMedia.length > 0;
  const video = selectedMedia.find((item) => item.type === "video");
  const isVideo = Boolean(video);
  const videoDurationSec = video?.duration ? Math.round(video.duration / 1000) : 0;

  const loadCreator = async () => {
    setCreator(null);
    setLoadError(null);
    try {
      const platformId = tiktokIdentifier?.split(":")[1];
      const { data } = await platformAPI.getTikTokCreatorInfo(platformId);
      setCreator(data.creator);
    } catch (err) {
      setLoadError(err.message || "Couldn't load your TikTok account. Try again.");
    }
  };

  const open = () => {
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
      if (next.brandedContent && next.privacyLevel === "SELF_ONLY") {
        next.privacyLevel = null;
      }
      return next;
    });
  };

  const problem = loadError || tiktokSettingsProblem({ settings, creator, isVideo, videoDurationSec });

  const confirm = () => {
    if (problem) return;
    setConfirmed(settings);
    setVisible(false);
    onConfirmed();
  };

  return {
    needsSettings,
    visible,
    creator,
    loadError,
    settings,
    isVideo,
    problem,
    payload: needsSettings ? confirmed : null,
    open,
    close: () => setVisible(false),
    retry: loadCreator,
    update,
    confirm,
  };
}
