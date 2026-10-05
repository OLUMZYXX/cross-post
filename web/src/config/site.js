export const SITE = {
  name: "Cross-Post",
  url: "https://www.cross-post.xyz",
  tagline: "Write once, post everywhere",
  description:
    "Cross-Post publishes one post to Instagram, TikTok, X, Facebook, LinkedIn, YouTube, Reddit and Telegram at once. Tailor captions with AI, schedule ahead and track every result from one app.",
  ogAlt: "Cross-Post: write once, post everywhere",
  keywords: [
    "cross post to multiple social media",
    "post to all social media at once",
    "social media scheduler",
    "schedule Instagram and TikTok posts",
    "AI caption generator",
    "social media management app",
    "Cross-Post",
  ],
};

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/features/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/how-it-works/", priority: 0.8, changeFrequency: "monthly" },
  { path: "/about/", priority: 0.6, changeFrequency: "yearly" },
  { path: "/support/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/signup/", priority: 0.7, changeFrequency: "yearly" },
  { path: "/signin/", priority: 0.4, changeFrequency: "yearly" },
  { path: "/privacy/", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms/", priority: 0.3, changeFrequency: "yearly" },
];

export const PRIVATE_PATHS = [
  "/dashboard/",
  "/create/",
  "/posts/",
  "/calendar/",
  "/analytics/",
  "/notifications/",
  "/settings/",
];
