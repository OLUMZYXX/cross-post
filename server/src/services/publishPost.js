import Platform from "../models/Platform.js";
import User from "../models/User.js";
import { getWorkspaceId } from "./teamService.js";
import { ensureValidToken } from "./tokenRefresh.js";
import { logger } from "../utils/logger.js";
import { publishToTwitter } from "./publishers/twitter.publisher.js";
import { publishToFacebook } from "./publishers/facebook.publisher.js";
import { publishToInstagram } from "./publishers/instagram.publisher.js";
import { publishToTikTok } from "./publishers/tiktok.publisher.js";
import { publishToLinkedIn } from "./publishers/linkedin.publisher.js";
import { publishToYouTube } from "./publishers/youtube.publisher.js";
import { publishToReddit } from "./publishers/reddit.publisher.js";
import { publishToTelegram } from "./publishers/telegram.publisher.js";
import { deleteFromTwitter } from "./publishers/twitter.publisher.js";
import { deleteFromFacebook } from "./publishers/facebook.publisher.js";
import { deleteFromInstagram } from "./publishers/instagram.publisher.js";
import { deleteFromTikTok } from "./publishers/tiktok.publisher.js";
import { deleteFromLinkedIn } from "./publishers/linkedin.publisher.js";
import { deleteFromYouTube } from "./publishers/youtube.publisher.js";
import { deleteFromReddit } from "./publishers/reddit.publisher.js";
import { deleteFromTelegram } from "./publishers/telegram.publisher.js";
import fs from "fs";
import path from "path";
import { CLIENT_URL, SERVER_URL } from "../config/env.js";

const publishers = {
  Twitter: publishToTwitter,
  Facebook: publishToFacebook,
  Instagram: publishToInstagram,
  TikTok: publishToTikTok,
  LinkedIn: publishToLinkedIn,
  YouTube: publishToYouTube,
  Reddit: publishToReddit,
  Telegram: publishToTelegram,
};

async function publishSinglePlatform(baseName, platform, publisher, post, facebookPageIds) {
  const startedAt = Date.now();
  const ctx = {
    platform: baseName,
    account: platform.platformUsername || platform.platformUserId || null,
    user: post.userId?.toString?.() || post.userId,
    post: post._id?.toString?.() || post._id,
    captionLen: (post.caption || "").length,
    mediaCount: (post.media || []).length,
  };
  logger.publish("ATTEMPT", ctx);
  try {
    await ensureValidToken(platform);

    let result;
    if (baseName === "Facebook" && facebookPageIds.length > 0) {
      const originalSelected = platform.selectedPageIds;
      platform.selectedPageIds = facebookPageIds;
      result = await publisher(platform, post);
      platform.selectedPageIds = originalSelected;
    } else {
      result = await publisher(platform, post);
    }

    const ms = Date.now() - startedAt;
    if (Array.isArray(result)) {
      logger.publish("SUCCESS", { ...ctx, ms, count: result.length });
      return result.map((r) => ({
        platform: baseName,
        success: true,
        externalId: r.externalId || null,
        externalUrl: r.externalUrl || null,
        pageAccessToken: r.pageAccessToken || null,
        pageName: r.pageName || null,
        error: null,
      }));
    }

    logger.publish("SUCCESS", { ...ctx, ms, externalId: result.externalId, url: result.externalUrl });
    return [{
      platform: baseName,
      success: true,
      externalId: result.externalId || null,
      externalUrl: result.externalUrl || null,
      error: null,
    }];
  } catch (err) {
    const ms = Date.now() - startedAt;
    logger.publish("FAIL", {
      ...ctx,
      ms,
      error: err.message,
      detail: err.rawDetail,
      httpStatus: err.httpStatus,
    });
    return [{
      platform: baseName,
      success: false,
      externalId: null,
      externalUrl: null,
      error: err.message,
    }];
  }
}

const deleters = {
  Twitter: deleteFromTwitter,
  Facebook: deleteFromFacebook,
  Instagram: deleteFromInstagram,
  TikTok: deleteFromTikTok,
  LinkedIn: deleteFromLinkedIn,
  YouTube: deleteFromYouTube,
  Reddit: deleteFromReddit,
  Telegram: deleteFromTelegram,
};

function parseIdentifier(identifier) {
  const parts = identifier.split(":");
  const baseName = parts[0];
  const subId = parts.length > 1 ? parts[1] : null;
  const isFacebookPage = baseName === "Facebook" && subId;
  const isMultiAccount = !isFacebookPage && subId;
  return { baseName, subId, isFacebookPage, isMultiAccount };
}

async function resolveWorkspaceId(userId) {
  const actingUser = await User.findById(userId).select("teamOwnerId");
  return actingUser ? getWorkspaceId(actingUser) : userId;
}

export async function publishToAllPlatforms(userId, post) {
  const platformIdentifiers = post.platforms || [];
  const results = [];

  const workspaceId = await resolveWorkspaceId(userId);
  const connectedPlatforms = await Platform.find({ userId: workspaceId });

  logger.publish("BATCH", {
    user: userId?.toString?.() || userId,
    workspace: workspaceId,
    post: post._id?.toString?.() || post._id,
    targets: platformIdentifiers.join(","),
    connected: connectedPlatforms.map((p) => p.name).join(","),
  });

  const facebookPageIds = platformIdentifiers
    .filter((p) => p.startsWith("Facebook:"))
    .map((p) => p.split(":")[1]);

  const platformCaptions = post.platformCaptions || {};
  const basePost = typeof post.toObject === "function" ? post.toObject() : post;

  const processed = new Set();
  const publishTasks = [];

  for (const identifier of platformIdentifiers) {
    const { baseName, subId, isFacebookPage, isMultiAccount } =
      parseIdentifier(identifier);

    if (isFacebookPage) {
      if (processed.has("Facebook")) continue;
      processed.add("Facebook");
    } else {
      if (processed.has(identifier)) continue;
      processed.add(identifier);
    }

    let platform;
    if (isMultiAccount) {
      platform = connectedPlatforms.find(
        (p) => p._id.toString() === subId,
      );
    } else {
      platform = connectedPlatforms.find((p) => p.name === baseName);
    }

    if (!platform) {
      logger.publish("SKIP", { platform: baseName, reason: "not connected in workspace", workspace: workspaceId });
      results.push({
        platform: baseName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: `${baseName} is not connected. Please connect it first.`,
      });
      continue;
    }

    const publisher = publishers[baseName];
    if (!publisher) {
      logger.publish("SKIP", { platform: baseName, reason: "unsupported" });
      results.push({
        platform: baseName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: `Publishing to ${baseName} is not supported yet.`,
      });
      continue;
    }

    const override = platformCaptions[baseName];
    const postForPlatform =
      typeof override === "string" && override.trim()
        ? { ...basePost, caption: override }
        : post;

    publishTasks.push(
      publishSinglePlatform(baseName, platform, publisher, postForPlatform, facebookPageIds)
    );
  }

  const settled = await Promise.allSettled(publishTasks);

  for (const outcome of settled) {
    if (outcome.status === "fulfilled") {
      results.push(...outcome.value);
    }
  }

  return results;
}

export async function deleteFromAllPlatforms(userId, post) {
  const results = [];

  if (!post.publishResults || post.publishResults.length === 0) return results;

  const workspaceId = await resolveWorkspaceId(userId);
  const connectedPlatforms = await Platform.find({ userId: workspaceId });

  for (const pr of post.publishResults) {
    const platformName = pr.platform;
    const externalId = pr.externalId;

    if (!externalId || !pr.success) {
      results.push({
        platform: platformName,
        success: false,
        error: "No external id or not published",
      });
      continue;
    }

    const platform = connectedPlatforms.find((p) => p.name === platformName);
    if (!platform) {
      results.push({
        platform: platformName,
        success: false,
        error: "Platform not connected",
      });
      continue;
    }

    const deleter = deleters[platformName];
    if (!deleter) {
      results.push({
        platform: platformName,
        success: false,
        error: "Deletion not supported for this platform",
      });
      continue;
    }

    try {
      await ensureValidToken(platform);

      if (platformName === "Facebook" && pr.pageAccessToken) {
        await deleter(platform, externalId, pr.pageAccessToken);
      } else {
        await deleter(platform, externalId);
      }
      results.push({ platform: platformName, success: true });
    } catch (err) {
      console.error(`Failed to delete on ${platformName}:`, err.message || err);
      results.push({
        platform: platformName,
        success: false,
        error: err.message || String(err),
      });
    }
  }

  return results;
}
