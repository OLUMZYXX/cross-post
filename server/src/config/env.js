import "dotenv/config";

export const PORT = process.env.PORT || 4000;
export const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crosspost";
export const JWT_SECRET = process.env.JWT_SECRET || "crosspost-dev-secret-change-in-production";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
