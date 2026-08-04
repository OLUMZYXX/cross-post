import { logger, safeBody } from "../../utils/logger.js";

const INIT_URL = "https://open.tiktokapis.com/v2/post/publish/video/init/";
const TITLE_MAX = 150;

async function downloadVideo(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Could not download the video for TikTok. Try again.");
  }
  return Buffer.from(await res.arrayBuffer());
}

async function initUpload(accessToken, caption, size) {
  const res = await fetch(INIT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_info: {
        title: caption ? caption.slice(0, TITLE_MAX) : "",
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

  if (!res.ok || data.error?.code) {
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

function friendlyTikTokError(data, status) {
  const raw = `${data?.error?.code || ""} ${data?.error?.message || ""}`.toLowerCase();

  if (raw.includes("scope") || raw.includes("permission") || status === 403) {
    return "Your TikTok connection is missing posting permission. Reconnect TikTok in Settings.";
  }
  if (raw.includes("access_token") || raw.includes("token") || status === 401) {
    return "Your TikTok connection has expired. Please reconnect TikTok in Settings.";
  }
  if (raw.includes("spam") || raw.includes("rate")) {
    return "TikTok is temporarily limiting posts from this account. Wait a few minutes and try again.";
  }
  if (raw.includes("privacy") || raw.includes("unaudited")) {
    return "TikTok requires this account to be verified for public posting. The post was created as private.";
  }
  return data?.error?.message || "We couldn't post this to TikTok. Please try again.";
}

export async function publishToTikTok(platform, post) {
  const { accessToken } = platform;
  const { caption, media } = post;

  if (!media || media.length === 0) {
    throw new Error(
      "TikTok requires a video to publish. Text-only posts are not supported.",
    );
  }

  const mediaUrl = typeof media[0] === "string" ? media[0] : media[0]?.uri;

  if (!mediaUrl || !mediaUrl.startsWith("http")) {
    throw new Error("TikTok requires an uploaded video. Attach a video and try again.");
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
