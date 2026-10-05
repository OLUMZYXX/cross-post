export function postTimestamp(post) {
  return new Date(post.publishedAt || post.scheduledAt || post.createdAt || 0).getTime();
}

export function latestPosts(posts, limit) {
  return posts
    .filter((post) => post.status === "published")
    .sort((a, b) => postTimestamp(b) - postTimestamp(a))
    .slice(0, limit);
}

export function upcomingPosts(posts, limit) {
  const now = Date.now();
  return posts
    .filter((post) => post.status === "scheduled" && postTimestamp(post) >= now)
    .sort((a, b) => postTimestamp(a) - postTimestamp(b))
    .slice(0, limit);
}

export function relativeDay(value) {
  const date = new Date(value);
  const today = new Date();
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOf(date) - startOf(today)) / 86400000);
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${time}`;
  if (diffDays === 1) return `Tomorrow, ${time}`;
  if (diffDays > 1 && diffDays < 7) return `${date.toLocaleDateString(undefined, { weekday: "long" })}, ${time}`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + `, ${time}`;
}
