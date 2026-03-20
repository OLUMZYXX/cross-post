export function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7;
  const today = new Date();
  const days = [];

  const prevMonth = new Date(year, month, 0);
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonth.getDate() - i);
    days.push({ date: d, isCurrentMonth: false, isToday: isSameDay(d, today) });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({ date, isCurrentMonth: true, isToday: isSameDay(date, today) });
  }

  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    days.push({ date, isCurrentMonth: false, isToday: isSameDay(date, today) });
  }

  return days;
}

export function getPostsForDate(posts, targetDate) {
  return posts.filter((post) => {
    const postDate = post.scheduledAt
      ? new Date(post.scheduledAt)
      : post.publishedAt
        ? new Date(post.publishedAt)
        : null;
    return postDate && isSameDay(postDate, targetDate);
  });
}

export function formatMonthYear(year, month) {
  return new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
