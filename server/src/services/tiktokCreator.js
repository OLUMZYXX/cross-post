import Platform from "../models/Platform.js";
import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";
import { logger, safeBody } from "../utils/logger.js";
import { getWorkspaceId } from "./teamService.js";
import { ensureValidToken } from "./tokenRefresh.js";
import { TIKTOK_PRIVACY_LEVELS } from "./tiktokSettings.js";

const CREATOR_INFO_URL = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";

const BLOCKING_ERRORS = {
  spam_risk_too_many_posts: "This TikTok account has hit TikTok's posting limit for today. Try again tomorrow.",
  spam_risk_user_banned_from_posting: "TikTok isn't letting this account post right now. Check the TikTok app for details.",
  reached_active_user_cap: "TikTok's daily limit for apps posting on your behalf has been reached. Try again later.",
};

async function findTikTokPlatform(userId, platformId) {
  const user = await User.findById(userId).select("teamOwnerId");
  const workspaceId = user ? getWorkspaceId(user) : userId;
  const query = { userId: workspaceId, name: "TikTok" };
  if (platformId) query._id = platformId;
  const platform = await Platform.findOne(query);
  if (!platform) throw Errors.notFound("TikTok isn't connected. Connect it in Connected accounts first.");
  return platform;
}

function normalize(info) {
  return {
    username: info.creator_username || null,
    nickname: info.creator_nickname || info.creator_username || "Your TikTok account",
    avatarUrl: info.creator_avatar_url || null,
    privacyOptions: (info.privacy_level_options || []).filter((level) => TIKTOK_PRIVACY_LEVELS.includes(level)),
    commentDisabled: Boolean(info.comment_disabled),
    duetDisabled: Boolean(info.duet_disabled),
    stitchDisabled: Boolean(info.stitch_disabled),
    maxVideoDurationSec: info.max_video_post_duration_sec || null,
  };
}

export async function getTikTokCreatorInfo(userId, platformId) {
  const platform = await findTikTokPlatform(userId, platformId);

  try {
    await ensureValidToken(platform);
  } catch {
    throw Errors.unauthorized("Your TikTok connection has expired. Reconnect TikTok in Connected accounts.");
  }

  const res = await fetch(CREATOR_INFO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${platform.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
  });
  const data = await res.json().catch(() => ({}));
  const code = data.error?.code;

  if (code && code !== "ok") {
    logger.apiError("TikTok", { stage: "creator-info", status: res.status, body: safeBody(data) });
    if (BLOCKING_ERRORS[code]) {
      return { ...normalize({}), canPost: false, blockedReason: BLOCKING_ERRORS[code] };
    }
    if (res.status === 401 || code.includes("token")) {
      throw Errors.unauthorized("Your TikTok connection has expired. Reconnect TikTok in Connected accounts.");
    }
    throw Errors.badRequest("Couldn't load your TikTok account details. Please try again.");
  }

  return { ...normalize(data.data || {}), canPost: true, blockedReason: null };
}
