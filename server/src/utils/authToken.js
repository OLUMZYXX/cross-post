import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role || "owner",
      teamOwnerId: (user.teamOwnerId || user._id).toString(),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}
