import { uploadMediaToTwitter, isVideoUrl } from "./twitter.helpers.js";
import { logger, safeBody } from "../../utils/logger.js";

const TWITTER_CHAR_LIMIT = 25000;
const TWITTER_BASIC_LIMIT = 280;

function friendlyTwitterError(textLength, data, status) {
  const raw = (
    data?.errors?.[0]?.message ||
    data?.detail ||
    data?.title ||
    ""
  ).toLowerCase();

  const looksLikeLength =
    raw.includes("280") ||
    raw.includes("too long") ||
    raw.includes("maximum") ||
    raw.includes("length") ||
    raw.includes("character");

  if (textLength > TWITTER_BASIC_LIMIT && (looksLikeLength || status === 403)) {
    return "This post is too long for X. Posts over 280 characters need X Premium on the connected X account. Shorten it to 280 characters, or upgrade that account to X Premium.";
  }

  if (status === 429 || raw.includes("rate limit") || raw.includes("too many")) {
    return "X is temporarily limiting how often you can post. Please wait a few minutes and try again.";
  }

  if (raw.includes("duplicate")) {
    return "X blocked this because the same post was shared recently. Edit the text and try again.";
  }

  if (status === 401 || raw.includes("unauthorized") || raw.includes("token")) {
    return "Your X account connection has expired. Please reconnect X in Settings and try again.";
  }

  return "We couldn't post this to X. Please try again in a moment.";
}

export async function publishToTwitter(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  const text =
    caption.length > TWITTER_CHAR_LIMIT
      ? caption.slice(0, TWITTER_CHAR_LIMIT - 3) + "..."
      : caption;
  const tweetBody = { text };

  if (media && media.length > 0) {
    const mediaUrls = media
      .map((m) => (typeof m === "string" ? m : m?.uri))
      .filter((url) => url && url.startsWith("http"));

    console.log(`[Twitter] media count: ${media.length}, valid URLs: ${mediaUrls.length}`);

    if (mediaUrls.length > 0) {
      const mediaIds = [];
      const maxMedia = mediaUrls.some((u) => isVideoUrl(u)) ? 1 : 4;
      const toUpload = mediaUrls.slice(0, maxMedia);

      for (const url of toUpload) {
        const mediaId = await uploadMediaToTwitter(accessToken, url);
        mediaIds.push(mediaId);
      }

      if (mediaIds.length > 0) {
        tweetBody.media = { media_ids: mediaIds };
      }
      console.log(`[Twitter] Tweet body:`, JSON.stringify(tweetBody));
    }
  }

  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tweetBody),
  });

  const data = await response.json();

  if (!response.ok || data.errors) {
    logger.apiError("Twitter", {
      status: response.status,
      textLen: text.length,
      hasMedia: !!tweetBody.media,
      body: safeBody(data),
    });
    const err = new Error(friendlyTwitterError(text.length, data, response.status));
    err.httpStatus = response.status;
    err.rawDetail = safeBody(data, 200);
    throw err;
  }

  return {
    externalId: data.data.id,
    externalUrl: `https://twitter.com/i/web/status/${data.data.id}`,
  };
}

export async function deleteFromTwitter(platform, externalId) {
  const { accessToken } = platform;

  const response = await fetch(
    `https://api.x.com/2/tweets/${externalId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg =
      data?.title || data?.detail || data?.error || "Failed to delete tweet";
    throw new Error(msg);
  }

  return true;
}
