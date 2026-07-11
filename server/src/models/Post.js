import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  platformCaptions: {
    type: mongoose.Schema.Types.Mixed,
    default: undefined,
  },
  contentHash: {
    type: String,
    default: null,
  },
  media: [
    {
      type: String,
    },
  ],
  platforms: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ["draft", "scheduled", "publishing", "published"],
    default: "draft",
  },
  scheduledAt: {
    type: Date,
    default: null,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
  publishResults: [
    {
      platform: String,
      success: Boolean,
      externalId: String,
      externalUrl: String,
      error: String,
      pageAccessToken: String,
      pageName: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ status: 1, scheduledAt: 1 });
postSchema.index({ userId: 1, contentHash: 1, status: 1 });

postSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("Post", postSchema);
