import mongoose from "mongoose";

const platformSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  connected: {
    type: Boolean,
    default: true,
  },
  connectedAt: {
    type: Date,
    default: Date.now,
  },
  // OAuth fields
  accessToken: {
    type: String,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  tokenExpiresAt: {
    type: Date,
    default: null,
  },
  platformUserId: {
    type: String,
    default: null,
  },
  platformUsername: {
    type: String,
    default: null,
  },
  // Facebook/Instagram Page fields
  pageId: {
    type: String,
    default: null,
  },
  pageAccessToken: {
    type: String,
    default: null,
  },
});

export default mongoose.model("Platform", platformSchema);
