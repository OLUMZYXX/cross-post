import Post from "../models/Post.js";
import { hashCaption } from "../utils/contentHash.js";

export async function findDuplicatePost(userId, caption) {
  const contentHash = hashCaption(caption);
  if (!contentHash) return null;

  const existing = await Post.findOne({
    userId,
    contentHash,
    status: { $in: ["published", "scheduled"] },
  }).sort({ publishedAt: -1, scheduledAt: -1, createdAt: -1 });

  if (!existing) return null;

  return {
    id: existing._id,
    status: existing.status,
    publishedAt: existing.publishedAt,
    scheduledAt: existing.scheduledAt,
    platforms: existing.platforms,
    captionPreview: (existing.caption || "").slice(0, 80),
  };
}
