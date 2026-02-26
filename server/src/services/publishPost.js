import Platform from "../models/Platform.js";
import { ensureValidToken } from "./tokenRefresh.js";
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

    if (Array.isArray(result)) {
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

    return [{
      platform: baseName,
      success: true,
      externalId: result.externalId || null,
      externalUrl: result.externalUrl || null,
      error: null,
    }];
  } catch (err) {
    console.error(`Failed to publish to ${baseName}:`, err.message);
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

/**
 * Publish a post to all selected platforms.
 * Returns an array of per-platform results.
 */
function parseIdentifier(identifier) {
  const parts = identifier.split(":");
  const baseName = parts[0];
  const subId = parts.length > 1 ? parts[1] : null;
  const isFacebookPage = baseName === "Facebook" && subId;
  const isMultiAccount = !isFacebookPage && subId;
  return { baseName, subId, isFacebookPage, isMultiAccount };
}

export async function publishToAllPlatforms(userId, post) {
  const platformIdentifiers = post.platforms || [];
  const results = [];

  const connectedPlatforms = await Platform.find({ userId });

  const facebookPageIds = platformIdentifiers
    .filter((p) => p.startsWith("Facebook:"))
    .map((p) => p.split(":")[1]);

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
      results.push({
        platform: baseName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: `Publishing to ${baseName} is not supported yet.`,
      });
      continue;
    }

    publishTasks.push(
      publishSinglePlatform(baseName, platform, publisher, post, facebookPageIds)
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

/**
 * Delete published posts from external platforms using stored publishResults
 */
export async function deleteFromAllPlatforms(userId, post) {
  const results = [];

  if (!post.publishResults || post.publishResults.length === 0) return results;

  // Fetch connected platforms to get tokens and details
  const connectedPlatforms = await Platform.find({ userId });

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
