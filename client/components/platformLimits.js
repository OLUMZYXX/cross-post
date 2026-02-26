export const PLATFORM_LIMITS = {
  Twitter: { chars: 280, maxImages: 4, maxVideos: 1, note: null },
  Instagram: { chars: 2200, maxImages: 10, maxVideos: 1, note: null },
  LinkedIn: { chars: 3000, maxImages: 9, maxVideos: 0, note: "No video" },
  Facebook: { chars: 63206, maxImages: 10, maxVideos: 1, note: null },
  TikTok: { chars: 150, maxImages: 0, maxVideos: 1, note: "Video only" },
  YouTube: { chars: 100, maxImages: 0, maxVideos: 1, note: "Video only" },
  Reddit: { chars: 300, maxImages: 0, maxVideos: 0, note: "Text only" },
  Telegram: { chars: 4096, maxImages: 10, maxVideos: 1, note: null },
};

export function getCaptionStatus(platformName, captionLength) {
  const baseName = platformName.split(":")[0];
  const limits = PLATFORM_LIMITS[baseName];
  if (!limits) return { limit: 0, remaining: 0, isOver: false, percent: 0 };

  const remaining = limits.chars - captionLength;
  const percent = Math.min((captionLength / limits.chars) * 100, 100);
  return {
    limit: limits.chars,
    remaining,
    isOver: remaining < 0,
    percent,
  };
}

export function getMediaNote(platformName, mediaType, mediaCount) {
  const baseName = platformName.split(":")[0];
  const limits = PLATFORM_LIMITS[baseName];
  if (!limits) return null;

  if (limits.note) return limits.note;
  if (mediaType === "video" && limits.maxVideos === 0) return "No video support";
  if (mediaType !== "video" && mediaCount > limits.maxImages && limits.maxImages > 0) {
    return `Max ${limits.maxImages} images`;
  }
  return null;
}
