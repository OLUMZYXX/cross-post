export const PLATFORM_STYLES = {
  Twitter: { icon: "logo-twitter", color: "#1DA1F2" },
  Instagram: { icon: "logo-instagram", color: "#E4405F" },
  LinkedIn: { icon: "logo-linkedin", color: "#0A66C2" },
  Facebook: { icon: "logo-facebook", color: "#1877F2" },
  TikTok: { icon: "logo-tiktok", color: "#fff" },
  YouTube: { icon: "logo-youtube", color: "#FF0000" },
  Reddit: { icon: "logo-reddit", color: "#FF4500" },
  Telegram: { icon: "paper-plane", color: "#0EA5E9" },
};

export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};
