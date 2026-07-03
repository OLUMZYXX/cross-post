import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  isUserPro,
  getProSource,
  trialDaysLeft,
} from "../services/proAccess.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    default: null,
  },
  appleId: {
    type: String,
    default: null,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  pushToken: {
    type: String,
    default: null,
  },
  notificationPreferences: {
    pushEnabled: { type: Boolean, default: true },
    emailEnabled: { type: Boolean, default: false },
    postAlerts: { type: Boolean, default: true },
    scheduleReminders: { type: Boolean, default: true },
  },
  watermark: {
    enabled: { type: Boolean, default: false },
    publicId: { type: String, default: null },
    url: { type: String, default: null },
    position: { type: String, default: "top-right" },
    size: { type: Number, default: 18 },
    opacity: { type: Number, default: 85 },
  },
  subscription: {
    isPro: { type: Boolean, default: false },
    plan: { type: String, default: null },
    store: { type: String, default: null },
    productId: { type: String, default: null },
    expiresAt: { type: Date, default: null },
    willRenew: { type: Boolean, default: false },
    originalTransactionId: { type: String, default: null },
    updatedAt: { type: Date, default: null },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.virtual("password").set(function (value) {
  this._password = value;
});

userSchema.pre("save", async function () {
  if (this._password) {
    this.passwordHash = await bcrypt.hash(this._password, 12);
    this._password = undefined;
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    throw new Error(
      "Account password needs to be reset. Please sign up again.",
    );
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  userObject.hasPassword = !!userObject.passwordHash;
  userObject.isPro = isUserPro(this);
  userObject.proSource = getProSource(this);
  userObject.trialDaysLeft = trialDaysLeft(this);
  delete userObject.passwordHash;
  delete userObject.twoFactorSecret;
  return userObject;
};

export default mongoose.model("User", userSchema);
