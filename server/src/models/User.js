import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
  delete userObject.passwordHash;
  return userObject;
};

export default mongoose.model("User", userSchema);
