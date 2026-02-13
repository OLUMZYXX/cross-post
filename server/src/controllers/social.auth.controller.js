import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import { Errors } from "../utils/AppError.js";

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

function sanitiseUser(user) {
  const { passwordHash, ...safe } = user.toObject();
  return safe;
}

export async function googleAuth(req, res) {
  const { accessToken } = req.body;
  if (!accessToken) throw Errors.badRequest("Access token is required");

  const googleRes = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  const profile = await googleRes.json();

  if (!profile.sub) throw Errors.unauthorized("Invalid Google token");

  let user = await User.findOne({ googleId: profile.sub });

  if (!user) {
    user = await User.findOne({ email: profile.email });
    if (user) {
      user.googleId = profile.sub;
      await user.save();
    } else {
      user = await new User({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        googleId: profile.sub,
      }).save();
    }
  }

  const token = generateToken(user);
  res.json({ success: true, data: { user: sanitiseUser(user), token } });
}

export async function appleAuth(req, res) {
  const { identityToken, fullName, email } = req.body;
  if (!identityToken) throw Errors.badRequest("Identity token is required");

  const parts = identityToken.split(".");
  const payload = JSON.parse(
    Buffer.from(parts[1], "base64url").toString("utf8"),
  );
  const appleId = payload.sub;
  const appleEmail = payload.email || email;

  if (!appleId) throw Errors.unauthorized("Invalid Apple token");

  let user = await User.findOne({ appleId });

  if (!user) {
    if (appleEmail) {
      user = await User.findOne({ email: appleEmail });
    }
    if (user) {
      user.appleId = appleId;
      await user.save();
    } else {
      const givenName = fullName?.givenName || "";
      const familyName = fullName?.familyName || "";
      const name =
        `${givenName} ${familyName}`.trim() ||
        (appleEmail ? appleEmail.split("@")[0] : "Apple User");
      user = await new User({
        name,
        email: appleEmail || `${appleId}@privaterelay.appleid.com`,
        appleId,
      }).save();
    }
  }

  const token = generateToken(user);
  res.json({ success: true, data: { user: sanitiseUser(user), token } });
}
