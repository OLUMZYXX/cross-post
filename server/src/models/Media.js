import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  filename: { type: String },
  data: { type: Buffer, required: true },
  contentType: { type: String },
  size: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Media", mediaSchema);
