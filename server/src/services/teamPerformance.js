import User from "../models/User.js";
import Post from "../models/Post.js";
import { getTeamUserIds } from "./teamService.js";

const RECENT_LIMIT = 8;

export function monthRange(month) {
  const now = new Date();
  const [year, m] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  return {
    label: `${year}-${String(m).padStart(2, "0")}`,
    start: new Date(year, m - 1, 1),
    end: new Date(year, m, 1),
  };
}

function emptyBucket(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || "owner",
    published: 0,
    scheduled: 0,
    succeeded: 0,
    failed: 0,
    platforms: {},
    days: new Set(),
    lastPostAt: null,
    recentPosts: [],
  };
}

function addPost(bucket, post, start, end) {
  const when = post.publishedAt || post.scheduledAt || post.createdAt;
  const isPublished =
    post.status === "published" && post.publishedAt >= start && post.publishedAt < end;
  const isScheduled =
    post.status === "scheduled" && post.scheduledAt >= start && post.scheduledAt < end;

  if (isPublished) {
    bucket.published += 1;
    bucket.days.add(new Date(post.publishedAt).toISOString().slice(0, 10));
    if (!bucket.lastPostAt || post.publishedAt > bucket.lastPostAt) {
      bucket.lastPostAt = post.publishedAt;
    }
  }
  if (isScheduled) bucket.scheduled += 1;

  for (const result of post.publishResults || []) {
    if (result.success) {
      bucket.succeeded += 1;
      const name = (result.platform || "").split(":")[0];
      if (name) bucket.platforms[name] = (bucket.platforms[name] || 0) + 1;
    } else {
      bucket.failed += 1;
    }
  }

  if (bucket.recentPosts.length < RECENT_LIMIT) {
    bucket.recentPosts.push({
      id: post._id,
      date: when,
      status: post.status,
      caption: (post.caption || "").slice(0, 90),
      platforms: [
        ...new Set((post.publishResults || []).map((r) => (r.platform || "").split(":")[0])),
      ].filter(Boolean),
      failedCount: (post.publishResults || []).filter((r) => !r.success).length,
    });
  }
}

function finalize(bucket) {
  const attempts = bucket.succeeded + bucket.failed;
  const { days, ...rest } = bucket;
  return {
    ...rest,
    activeDays: days.size,
    successRate: attempts ? Math.round((bucket.succeeded / attempts) * 100) : null,
  };
}

export async function buildTeamPerformance(workspaceId, month) {
  const { label, start, end } = monthRange(month);
  const teamUserIds = await getTeamUserIds(workspaceId);

  const users = await User.find({ _id: { $in: teamUserIds } }).select("name email role");
  const posts = await Post.find({
    userId: { $in: teamUserIds },
    $or: [
      { publishedAt: { $gte: start, $lt: end } },
      { scheduledAt: { $gte: start, $lt: end } },
    ],
  })
    .select("userId status publishResults publishedAt scheduledAt createdAt caption")
    .sort({ publishedAt: -1, scheduledAt: -1, createdAt: -1 });

  const byUser = {};
  for (const user of users) byUser[user._id.toString()] = emptyBucket(user);

  for (const post of posts) {
    const bucket = byUser[post.userId.toString()];
    if (bucket) addPost(bucket, post, start, end);
  }

  const members = Object.values(byUser)
    .map(finalize)
    .sort(
      (a, b) =>
        b.published - a.published ||
        b.succeeded - a.succeeded ||
        (b.successRate ?? 0) - (a.successRate ?? 0),
    )
    .map((member, index) => ({
      ...member,
      rank: member.published > 0 || member.scheduled > 0 ? index + 1 : null,
    }));

  const totals = members.reduce(
    (acc, m) => ({
      published: acc.published + m.published,
      scheduled: acc.scheduled + m.scheduled,
      succeeded: acc.succeeded + m.succeeded,
      failed: acc.failed + m.failed,
    }),
    { published: 0, scheduled: 0, succeeded: 0, failed: 0 },
  );
  const attempts = totals.succeeded + totals.failed;
  totals.successRate = attempts ? Math.round((totals.succeeded / attempts) * 100) : null;
  totals.activeMembers = members.filter((m) => m.published > 0).length;

  const topPlatforms = {};
  for (const m of members) {
    for (const [name, count] of Object.entries(m.platforms)) {
      topPlatforms[name] = (topPlatforms[name] || 0) + count;
    }
  }

  return { month: label, totals, members, topPlatforms };
}
