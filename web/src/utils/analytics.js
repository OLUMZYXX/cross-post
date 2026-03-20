const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeOverviewStats(sentPosts, allPosts) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - WEEK_MS);
  const twoWeeksAgo = new Date(now.getTime() - 2 * WEEK_MS);

  const totalReach = sentPosts.reduce((s, p) => s + (p.platforms?.length || 0), 0);
  const thisWeekPosts = sentPosts.filter((p) => new Date(p.publishedAt) >= weekAgo);
  const lastWeekPosts = sentPosts.filter((p) => {
    const d = new Date(p.publishedAt);
    return d >= twoWeeksAgo && d < weekAgo;
  });

  const growthPercent =
    lastWeekPosts.length > 0
      ? Math.round(((thisWeekPosts.length - lastWeekPosts.length) / lastWeekPosts.length) * 100)
      : thisWeekPosts.length > 0 ? 100 : 0;

  const scheduledCount = allPosts.filter((p) => p.status === "scheduled").length;
  const draftCount = allPosts.filter((p) => p.status === "draft").length;

  return { totalReach, thisWeekCount: thisWeekPosts.length, growthPercent, scheduledCount, draftCount };
}

function baseName(identifier) {
  return identifier.split(":")[0];
}

export function computePlatformStats(sentPosts) {
  const platforms = {};
  const ensure = (name) => {
    if (!platforms[name]) platforms[name] = { total: 0, success: 0, failed: 0 };
  };

  sentPosts.forEach((post) => {
    const targeted = new Set();
    (post.platforms || []).forEach((id) => targeted.add(baseName(id)));
    targeted.forEach((name) => { ensure(name); platforms[name].total += 1; });

    (post.publishResults || []).forEach((result) => {
      const name = baseName(result.platform);
      ensure(name);
      if (!targeted.has(name)) platforms[name].total += 1;
      if (result.success) platforms[name].success += 1;
      else platforms[name].failed += 1;
    });
  });

  return Object.entries(platforms)
    .map(([name, stats]) => {
      const attempts = stats.success + stats.failed;
      const successRate = attempts > 0 ? Math.round((stats.success / attempts) * 100) : 0;
      return { name, ...stats, successRate };
    })
    .sort((a, b) => b.total - a.total);
}

export function computeWeeklyActivity(sentPosts) {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const count = sentPosts.filter((p) => {
      const d = new Date(p.publishedAt);
      return d >= dayStart && d < dayEnd;
    }).length;
    days.push({ label: date.toLocaleDateString("en-US", { weekday: "short" }), count });
  }
  return { days, maxCount: Math.max(...days.map((d) => d.count), 1) };
}

export function computeMediaStats(sentPosts) {
  let withMedia = 0, textOnly = 0, totalMedia = 0;
  sentPosts.forEach((post) => {
    if (post.media?.length > 0) { withMedia += 1; totalMedia += post.media.length; }
    else textOnly += 1;
  });
  return { withMedia, textOnly, totalMedia };
}

export function computeSuccessFailure(sentPosts) {
  let totalSuccess = 0, totalFailed = 0;
  sentPosts.forEach((post) => {
    (post.publishResults || []).forEach((r) => {
      if (r.success) totalSuccess += 1; else totalFailed += 1;
    });
  });
  const total = totalSuccess + totalFailed;
  const successRate = total > 0 ? Math.round((totalSuccess / total) * 100) : 0;
  return { totalSuccess, totalFailed, total, successRate };
}
