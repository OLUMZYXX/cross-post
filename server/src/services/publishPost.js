import Platform from "../models/Platform.js";
import { ensureValidToken } from "./tokenRefresh.js";
import { publishToTwitter } from "./publishers/twitter.publisher.js";
import { publishToFacebook } from "./publishers/facebook.publisher.js";
import { publishToInstagram } from "./publishers/instagram.publisher.js";
import { publishToTikTok } from "./publishers/tiktok.publisher.js";
import { publishToLinkedIn } from "./publishers/linkedin.publisher.js";
import { publishToYouTube } from "./publishers/youtube.publisher.js";
import { publishToReddit } from "./publishers/reddit.publisher.js";
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

/**
 * Publish a post to all selected platforms.
 * Returns an array of per-platform results.
 */
export async function publishToAllPlatforms(userId, post) {
  const platformNames = post.platforms || [];
  const results = [];

  // Fetch all connected platforms for this user
  const connectedPlatforms = await Platform.find({
    userId,
    name: { $in: platformNames },
  });

  for (const platformName of platformNames) {
    const platform = connectedPlatforms.find((p) => p.name === platformName);

    if (!platform) {
      results.push({
        platform: platformName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: `${platformName} is not connected. Please connect it first.`,
      });
      continue;
    }

    const publisher = publishers[platformName];
    if (!publisher) {
      results.push({
        platform: platformName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: `Publishing to ${platformName} is not supported yet.`,
      });
      continue;
    }

    try {
      // Refresh token if expired
      await ensureValidToken(platform);

      const result = await publisher(platform, post);

      results.push({
        platform: platformName,
        success: true,
        externalId: result.externalId || null,
        externalUrl: result.externalUrl || null,
        error: null,
      });
    } catch (err) {
      console.error(`Failed to publish to ${platformName}:`, err.message);
      results.push({
        platform: platformName,
        success: false,
        externalId: null,
        externalUrl: null,
        error: err.message,
      });
    }
  }

  return results;
}
