import "dotenv/config";

export const PORT = process.env.PORT || 4000;
export const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crosspost";
export const JWT_SECRET =
  process.env.JWT_SECRET || "crosspost-dev-secret-change-in-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
export const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
export const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
export const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
export const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4000";
