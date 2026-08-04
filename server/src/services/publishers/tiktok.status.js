import { logger, safeBody } from "../../utils/logger.js";

const STATUS_URL = "https://open.tiktokapis.com/v2/post/publish/status/fetch/";
const POLL_ATTEMPTS = 6;
const POLL_DELAY_MS = 2000;

const FAIL_REASONS = {
  picture_size_check_failed:
    "TikTok rejected these images because they are too large. Photos must fit within 1080x1920 (portrait) or 1920x1080 (landscape).",
  photo_pull_failed:
    "TikTok could not download the photos from this server. Check that the domain is verified in the TikTok developer portal.",
  video_pull_failed: "TikTok could not download the video from this server.",
  file_format_check_failed:
    "TikTok rejected this file format. Use JPEG or WebP images.",
  spam_risk_too_many_posts:
    "TikTok has reached its posting limit for this account today. Try again tomorrow.",
  spam_risk_user_banned_from_posting:
    "TikTok has blocked posting from this account.",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPublishStatus(accessToken, publishId) {
  const res = await fetch(STATUS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publish_id: publishId }),
  });

  const data = await res.json().catch(() => ({}));
  return {
    ok: res.ok,
    status: data.data?.status || null,
    failReason: data.data?.fail_reason || null,
    raw: data,
  };
}

export async function waitForPublish(accessToken, publishId) {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    await sleep(POLL_DELAY_MS);

    const { ok, status, failReason, raw } = await fetchPublishStatus(
      accessToken,
      publishId,
    );

    if (!ok) {
      logger.apiError("TikTok", { stage: "status", body: safeBody(raw) });
      return { settled: false, status: null };
    }

    if (status === "FAILED") {
      logger.apiError("TikTok", {
        stage: "status",
        publishId,
        failReason,
        body: safeBody(raw),
      });
      const err = new Error(
        FAIL_REASONS[failReason] ||
          `TikTok could not publish this post (${failReason || "unknown reason"}).`,
      );
      err.rawDetail = failReason;
      throw err;
    }

    if (status === "PUBLISH_COMPLETE") {
      logger.info("TIKTOK:STATUS", { publishId, status });
      return { settled: true, status };
    }
  }

  logger.info("TIKTOK:STATUS", { publishId, status: "still_processing" });
  return { settled: false, status: "PROCESSING" };
}
