import mongoose from "mongoose";

const oauthStateSchema = new mongoose.Schema({
  stateId: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Auto-delete expired documents
oauthStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OAuthState", oauthStateSchema);
