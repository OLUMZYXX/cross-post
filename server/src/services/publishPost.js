import Platform from "../models/Platform.js";
import { ensureValidToken } from "./tokenRefresh.js";
import { publishToTwitter } from "./publishers/twitter.publisher.js";
import { publishToFacebook } from "./publishers/facebook.publisher.js";
import { publishToInstagram } from "./publishers/instagram.publisher.js";
import { publishToTikTok } from "./publishers/tiktok.publisher.js";
import { publishToLinkedIn } from "./publishers/linkedin.publisher.js";
import { publishToYouTube } from "./publishers/youtube.publisher.js";
import { publishToReddit } from "./publishers/reddit.publisher.js";
import { deleteFromTwitter } from "./publishers/twitter.publisher.js";
import { deleteFromFacebook } from "./publishers/facebook.publisher.js";
import { deleteFromInstagram } from "./publishers/instagram.publisher.js";
import { deleteFromTikTok } from "./publishers/tiktok.publisher.js";
import { deleteFromLinkedIn } from "./publishers/linkedin.publisher.js";
import { deleteFromYouTube } from "./publishers/youtube.publisher.js";
import { deleteFromReddit } from "./publishers/reddit.publisher.js";
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
};

const deleters = {
  Twitter: deleteFromTwitter,
  Facebook: deleteFromFacebook,
  Instagram: deleteFromInstagram,
  TikTok: deleteFromTikTok,
  LinkedIn: deleteFromLinkedIn,
  YouTube: deleteFromYouTube,
  Reddit: deleteFromReddit,
};

/**
 * Publish a post to all selected platforms.
 * Returns an array of per-platform results.
 */
export async function publishToAllPlatforms(userId, post) {
  const platformIdentifiers = post.platforms || [];
  const results = [];

  // Collect unique base platform names (e.g. "Facebook:abc123" -> "Facebook")
  const baseNames = [
    ...new Set(platformIdentifiers.map((p) => p.split(":")[0])),
  ];

  // Fetch all connected platforms for this user
  const connectedPlatforms = await Platform.find({
    userId,
    name: { $in: baseNames },
  });

  // Group Facebook page IDs from identifiers like "Facebook:pageId"
  const facebookPageIds = platformIdentifiers
    .filter((p) => p.startsWith("Facebook:"))
    .map((p) => p.split(":")[1]);

  // Track which base platforms we've already processed
  const processed = new Set();

  for (const identifier of platformIdentifiers) {
    const baseName = identifier.split(":")[0];

    // Skip if already processed (e.g. second Facebook page — handled together)
    if (processed.has(baseName)) continue;
    processed.add(baseName);

    const platform = connectedPlatforms.find((p) => p.name === baseName);

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

    try {
      // Refresh token if expired
      await ensureValidToken(platform);

      // For Facebook, temporarily override selectedPageIds to only post to chosen pages
      let result;
      if (baseName === "Facebook" && facebookPageIds.length > 0) {
        const originalSelected = platform.selectedPageIds;
        platform.selectedPageIds = facebookPageIds;
        result = await publisher(platform, post);
        platform.selectedPageIds = originalSelected;
      } else {
        result = await publisher(platform, post);
      }

      // Facebook returns an array of results (one per page)
      if (Array.isArray(result)) {
        for (const r of result) {
          results.push({
            platform: baseName,
            success: true,
            externalId: r.externalId || null,
            externalUrl: r.externalUrl || null,
            pageAccessToken: r.pageAccessToken || null,
            pageName: r.pageName || null,
            error: null,
          });
        }
      } else {
        results.push({
          platform: baseName,
          success: true,
          externalId: result.externalId || null,
          externalUrl: result.externalUrl || null,
          error: null,
        });
      }
    } catch (err) {
      console.error(`Failed to publish to ${baseName}:`, err.message);
      results.push({
        platform: baseName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: err.message,
      });
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
      results.push({ platform: platformName, success: false, error: "No external id or not published" });
      continue;
    }

    const platform = connectedPlatforms.find((p) => p.name === platformName);
    if (!platform) {
      results.push({ platform: platformName, success: false, error: "Platform not connected" });
      continue;
    }

    const deleter = deleters[platformName];
    if (!deleter) {
      results.push({ platform: platformName, success: false, error: "Deletion not supported for this platform" });
      continue;
    }

    try {
      // For Facebook, pass the page-specific access token stored during publish
      if (platformName === "Facebook" && pr.pageAccessToken) {
        await deleter(platform, externalId, pr.pageAccessToken);
      } else {
        await deleter(platform, externalId);
      }
      results.push({ platform: platformName, success: true });
    } catch (err) {
      console.error(`Failed to delete on ${platformName}:`, err.message || err);
      results.push({ platform: platformName, success: false, error: err.message || String(err) });
    }
  }

  return results;
}
