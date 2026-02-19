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
    enum: ["draft", "scheduled", "published"],
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

postSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

export default mongoose.model("Post", postSchema);
