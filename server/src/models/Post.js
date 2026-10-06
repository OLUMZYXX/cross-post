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
  tiktokSettings: {
    type: new mongoose.Schema(
      {
        privacyLevel: {
          type: String,
          enum: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"],
        },
        allowComment: { type: Boolean, default: false },
        allowDuet: { type: Boolean, default: false },
        allowStitch: { type: Boolean, default: false },
        discloseContent: { type: Boolean, default: false },
        yourBrand: { type: Boolean, default: false },
        brandedContent: { type: Boolean, default: false },
      },
      { _id: false },
    ),
    default: undefined,
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
