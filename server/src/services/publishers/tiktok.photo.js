import { SERVER_URL } from "../../config/env.js";
import { logger, safeBody } from "../../utils/logger.js";
import {
  CONTENT_INIT_URL,
  PHOTO_DESCRIPTION_MAX,
  PHOTO_MAX_COUNT,
  PHOTO_TITLE_MAX,
  friendlyTikTokError,
} from "./tiktok.helpers.js";
import { waitForPublish } from "./tiktok.status.js";

const ALLOWED_HOSTS = ["res.cloudinary.com"];
const PHOTO_TRANSFORM =
  "if_ar_gt_1.0/c_limit,w_1920,h_1080/if_else/c_limit,w_1080,h_1920/if_end/f_jpg,q_auto";

function withPhotoTransform(url) {
  const parts = url.match(/^(.*\/image\/upload\/)(.*)$/);
  if (!parts) return url;

  const rest = parts[2];
  const versioned = rest.match(/^(.*?)(v\d+\/.*)$/);

  return versioned
    ? `${parts[1]}${versioned[1]}${PHOTO_TRANSFORM}/${versioned[2]}`
    : `${parts[1]}${PHOTO_TRANSFORM}/${rest}`;
}

export function isProxyableImage(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

export function toProxiedImageUrl(url) {
  if (!isProxyableImage(url)) return url;
  const sized = withPhotoTransform(url);
  return `${SERVER_URL}/media/tiktok-image?src=${encodeURIComponent(sized)}`;
}

export async function streamProxiedImage(rawUrl, res) {
  if (!rawUrl || !isProxyableImage(rawUrl)) {
    return res.status(400).type("text/plain").send("Unsupported image source");
  }

  const upstream = await fetch(rawUrl);
  if (!upstream.ok) {
    return res.status(502).type("text/plain").send("Could not fetch image");
  }

  const buffer = Buffer.from(await upstream.arrayBuffer());
  res.set({
    "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
    "Content-Length": String(buffer.length),
    "Cache-Control": "public, max-age=86400",
  });
  res.send(buffer);
}

export async function publishPhotosToTikTok(accessToken, caption, imageUrls) {
  const photoImages = imageUrls.slice(0, PHOTO_MAX_COUNT).map(toProxiedImageUrl);

  const unreachable = photoImages.find((url) => !url.startsWith(SERVER_URL));
  if (unreachable) {
    throw new Error(
      "TikTok can only fetch photos hosted by this app. Re-upload the images and try again.",
    );
  }

  logger.info("TIKTOK:PHOTO", { count: photoImages.length, source: "PULL_FROM_URL" });

  const res = await fetch(CONTENT_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      media_type: "PHOTO",
      post_mode: "DIRECT_POST",
      post_info: {
        title: caption ? caption.slice(0, PHOTO_TITLE_MAX) : "",
        description: caption ? caption.slice(0, PHOTO_DESCRIPTION_MAX) : "",
        privacy_level: "SELF_ONLY",
        disable_comment: false,
        auto_add_music: true,
      },
      source_info: {
        source: "PULL_FROM_URL",
        photo_cover_index: 0,
        photo_images: photoImages,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data.error?.code && data.error.code !== "ok")) {
    logger.apiError("TikTok", { stage: "photo-init", status: res.status, body: safeBody(data) });
    const err = new Error(friendlyTikTokError(data, res.status));
    err.rawDetail = safeBody(data, 200);
    throw err;
  }

  const publishId = data.data?.publish_id;

  if (publishId) {
    await waitForPublish(accessToken, publishId);
  }

  return {
    externalId: publishId || "pending",
    externalUrl: "https://www.tiktok.com",
  };
}
