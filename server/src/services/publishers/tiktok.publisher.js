import { logger, safeBody } from "../../utils/logger.js";
import { publishPhotosToTikTok } from "./tiktok.photo.js";
import {
  VIDEO_INIT_URL,
  VIDEO_TITLE_MAX,
  friendlyTikTokError,
  isVideoUrl,
} from "./tiktok.helpers.js";

async function downloadVideo(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not download the video for TikTok. Try again.");
  }
  return Buffer.from(await res.arrayBuffer());
}

async function initUpload(accessToken, caption, size) {
  const res = await fetch(VIDEO_INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: {
        title: caption ? caption.slice(0, VIDEO_TITLE_MAX) : "",
        privacy_level: "SELF_ONLY",
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: size,
        chunk_size: size,
        total_chunk_count: 1,
      },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data.error?.code && data.error.code !== "ok")) {
    logger.apiError("TikTok", { stage: "init", status: res.status, body: safeBody(data) });
    const err = new Error(friendlyTikTokError(data, res.status));
    err.rawDetail = safeBody(data, 200);
    throw err;
  }

  return { publishId: data.data?.publish_id, uploadUrl: data.data?.upload_url };
}

async function uploadVideoBytes(uploadUrl, buffer) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(buffer.length),
      "Content-Range": `bytes 0-${buffer.length - 1}/${buffer.length}`,
    },
    body: buffer,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.apiError("TikTok", { stage: "upload", status: res.status, body: safeBody(body) });
    throw new Error("TikTok rejected the video upload. Try a smaller or shorter video.");
  }
}

const toUrl = (item) => (typeof item === "string" ? item : item?.uri);

export async function publishToTikTok(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  if (!media || media.length === 0) {
    throw new Error(
      "TikTok requires a video or photo to publish. Text-only posts are not supported.",
    );
  }

  const mediaUrls = media.map(toUrl).filter((url) => url && url.startsWith("http"));

  if (mediaUrls.length === 0) {
    throw new Error(
      "TikTok requires uploaded media. Attach a video or photo and try again.",
    );
  }

  const mediaUrl = mediaUrls[0];

  if (!isVideoUrl(mediaUrl)) {
    return publishPhotosToTikTok(
      accessToken,
      caption,
      mediaUrls.filter((url) => !isVideoUrl(url)),
    );
  }

  const buffer = await downloadVideo(mediaUrl);
  logger.info("TIKTOK:UPLOAD", { bytes: buffer.length, source: "FILE_UPLOAD" });

  const { publishId, uploadUrl } = await initUpload(accessToken, caption, buffer.length);

  if (!uploadUrl) {
    throw new Error("TikTok did not return an upload URL. Please try again.");
  }

  await uploadVideoBytes(uploadUrl, buffer);

  return {
    externalId: publishId || "pending",
    externalUrl: "https://www.tiktok.com",
  };
}

export async function deleteFromTikTok(platform, externalId) {
  const { accessToken } = platform;
  if (!accessToken) throw new Error("No access token for TikTok deletion");
  if (!externalId)
    throw new Error("No externalId provided for TikTok deletion");

  try {
    const res = await fetch(`https://open.tiktokapis.com/v2/post/remove/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publish_id: externalId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || data?.error) {
      throw new Error(
        data?.message ||
          data?.error_description ||
          "Failed to delete TikTok post",
      );
    }

    return true;
  } catch (err) {
    throw new Error(err.message || "TikTok deletion failed");
  }
}
