import Post from "../models/Post.js";
import User from "../models/User.js";
import { hashCaption } from "../utils/contentHash.js";
import { similarity } from "../utils/textSimilarity.js";
import { getWorkspaceId, getTeamUserIds } from "./teamService.js";

const WINDOW_DAYS = 5;
const THRESHOLD = 0.6;
const SCAN_LIMIT = 200;

export async function findDuplicatePost(user, caption, threshold = THRESHOLD) {
  if (!caption || !caption.trim()) return null;

  const workspaceId = getWorkspaceId(user);
  const teamUserIds = await getTeamUserIds(workspaceId);
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const recentPosts = await Post.find({
    userId: { $in: teamUserIds },
    status: { $in: ["published", "scheduled"] },
    $or: [
      { publishedAt: { $gte: since } },
      { scheduledAt: { $gte: since } },
      { createdAt: { $gte: since } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(SCAN_LIMIT);

  const incomingHash = hashCaption(caption);
  let best = null;
  let bestScore = 0;

  for (const post of recentPosts) {
    if (!post.caption) continue;
    const score =
      incomingHash && post.contentHash === incomingHash
        ? 1
        : similarity(caption, post.caption);
    if (score > bestScore) {
      bestScore = score;
      best = post;
    }
  }

  if (!best || bestScore < threshold) return null;

  const poster = await User.findById(best.userId).select("name email");
  const postedBy =
    best.userId.toString() === user._id.toString()
      ? "you"
      : poster?.name || poster?.email || "a teammate";

  return {
    id: best._id,
    matchPercent: Math.round(bestScore * 100),
    status: best.status,
    publishedAt: best.publishedAt,
    scheduledAt: best.scheduledAt,
    createdAt: best.createdAt,
    platforms: best.platforms,
    captionPreview: (best.caption || "").slice(0, 100),
    postedBy,
  };
}
