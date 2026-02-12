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
});

export default mongoose.model("Platform", platformSchema);
