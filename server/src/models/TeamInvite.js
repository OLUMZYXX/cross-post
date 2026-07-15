import mongoose from "mongoose";

const teamInviteSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerName: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

teamInviteSchema.index({ email: 1, status: 1 });
teamInviteSchema.index({ workspaceId: 1, status: 1 });

export default mongoose.model("TeamInvite", teamInviteSchema);
