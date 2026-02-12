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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Post", postSchema);
