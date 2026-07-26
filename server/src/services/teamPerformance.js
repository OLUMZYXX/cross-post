import User from "../models/User.js";
import Post from "../models/Post.js";
import { getTeamUserIds } from "./teamService.js";

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
    daily: {},
    weekdays: {},
    lastPostAt: null,
  };
}

function addPost(bucket, post, start, end) {
  const isPublished =
    post.status === "published" && post.publishedAt >= start && post.publishedAt < end;
  const isScheduled =
    post.status === "scheduled" && post.scheduledAt >= start && post.scheduledAt < end;

  if (isPublished) {
    bucket.published += 1;
    const posted = new Date(post.publishedAt);
    const day = posted.getDate();
    bucket.daily[day] = (bucket.daily[day] || 0) + 1;
    const dow = posted.getDay();
    bucket.weekdays[dow] = (bucket.weekdays[dow] || 0) + 1;
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

}

const WEEK_ORDER = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
  { dow: 0, label: "Sun" },
];

function finalize(bucket, daysInMonth) {
  const attempts = bucket.succeeded + bucket.failed;
  const { daily, weekdays, ...rest } = bucket;
  const series = [];
  for (let day = 1; day <= daysInMonth; day++) {
    series.push({ day, count: daily[day] || 0 });
  }
  const activeDays = series.filter((d) => d.count > 0).length;
  const weekly = WEEK_ORDER.map(({ dow, label }) => ({
    label,
    count: weekdays[dow] || 0,
  }));
  const bestWeekday = weekly.reduce((a, b) => (b.count > a.count ? b : a), weekly[0]);
  return {
    ...rest,
    daily: series,
    weekly,
    bestWeekday: bestWeekday.count > 0 ? bestWeekday.label : null,
    activeDays,
    busiestDay: series.reduce((a, b) => (b.count > a.count ? b : a), series[0] || null),
    avgPerActiveDay: activeDays ? Number((bucket.published / activeDays).toFixed(1)) : 0,
    successRate: attempts ? Math.round((bucket.succeeded / attempts) * 100) : null,
  };
}

export async function buildTeamPerformance(workspaceId, month) {
  const { label, start, end } = monthRange(month);
  const daysInMonth = new Date(end.getTime() - 1).getDate();
  const teamUserIds = await getTeamUserIds(workspaceId);

  const users = await User.find({ _id: { $in: teamUserIds } }).select("name email role");
  const posts = await Post.find({
    userId: { $in: teamUserIds },
    $or: [
      { publishedAt: { $gte: start, $lt: end } },
      { scheduledAt: { $gte: start, $lt: end } },
    ],
  })
    .select("userId status publishResults publishedAt scheduledAt createdAt")
    .sort({ publishedAt: -1, scheduledAt: -1, createdAt: -1 });

  const byUser = {};
  for (const user of users) byUser[user._id.toString()] = emptyBucket(user);

  for (const post of posts) {
    const bucket = byUser[post.userId.toString()];
    if (bucket) addPost(bucket, post, start, end);
  }

  const members = Object.values(byUser)
    .map((b) => finalize(b, daysInMonth))
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
