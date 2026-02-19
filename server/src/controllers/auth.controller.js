import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import User from "../models/User.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";
import { Errors } from "../utils/AppError.js";

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/** Short-lived token used only for 2FA login step */
function generateTempToken(user) {
  return jwt.sign({ id: user._id, twoFactor: true }, JWT_SECRET, {
    expiresIn: "5m",
  });
}

function sanitiseUser(user) {
  const { passwordHash, twoFactorSecret, ...safe } = user.toObject();
  return safe;
}

export async function signup(req, res) {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw Errors.conflict("Email is already registered");
  }

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  await user.save();

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    data: { user: sanitiseUser(user), token },
  });
}

export async function signin(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw Errors.unauthorized(
      "The email entered cannot be found or does not exist",
    );
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw Errors.unauthorized("The password is incorrect");
  }

  // If 2FA is enabled, return a temp token instead of full access
  if (user.twoFactorEnabled) {
    const tempToken = generateTempToken(user);
    return res.json({
      success: true,
      data: {
        requiresTwoFactor: true,
        tempToken,
      },
    });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    data: { user: sanitiseUser(user), token },
  });
}

/** Verify 2FA code during login and issue full token */
export async function login2FA(req, res) {
  const { tempToken, code } = req.body;

  if (!tempToken || !code) {
    throw Errors.badRequest("Temporary token and code are required");
  }

  let decoded;
  try {
    decoded = jwt.verify(tempToken, JWT_SECRET);
  } catch {
    throw Errors.unauthorized("Session expired. Please sign in again.");
  }

  if (!decoded.twoFactor) {
    throw Errors.unauthorized("Invalid token");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw Errors.unauthorized("2FA not configured");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    throw Errors.unauthorized("Invalid authentication code");
  }

  const token = generateToken(user);
  res.json({
    success: true,
    data: { user: sanitiseUser(user), token },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    throw Errors.notFound("User not found");
  }

  res.json({ success: true, data: { user: sanitiseUser(user) } });
}

export async function updateProfile(req, res) {
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw Errors.notFound("User not found");
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw Errors.conflict("Email is already in use");
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) {
    user.name = name.trim();
  }

  await user.save();

  res.json({ success: true, data: { user: sanitiseUser(user) } });
}

// ── 2FA Management (authenticated) ─────────────────────────

/** Generate TOTP secret + QR code for setup */
export async function setup2FA(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw Errors.notFound("User not found");

  if (user.twoFactorEnabled) {
    throw Errors.badRequest("2FA is already enabled");
  }

  const secret = speakeasy.generateSecret({
    name: `CrossPost (${user.email})`,
    issuer: "CrossPost",
  });

  // Store the secret temporarily (not yet enabled until verified)
  user.twoFactorSecret = secret.base32;
  await user.save();

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    data: {
      secret: secret.base32,
      qrCode: qrDataUrl,
    },
  });
}

/** Verify OTP code to confirm 2FA setup */
export async function verify2FA(req, res) {
  const { code } = req.body;
  if (!code) throw Errors.badRequest("Verification code is required");

  const user = await User.findById(req.user.id);
  if (!user) throw Errors.notFound("User not found");
  if (!user.twoFactorSecret) throw Errors.badRequest("Run setup first");

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    throw Errors.badRequest("Invalid code. Please try again.");
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ success: true, data: { twoFactorEnabled: true } });
}

/** Disable 2FA (requires current OTP code) */
export async function disable2FA(req, res) {
  const { code } = req.body;
  if (!code) throw Errors.badRequest("Verification code is required");

  const user = await User.findById(req.user.id);
  if (!user) throw Errors.notFound("User not found");

  if (!user.twoFactorEnabled) {
    throw Errors.badRequest("2FA is not enabled");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    throw Errors.unauthorized("Invalid code");
  }

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();

  res.json({ success: true, data: { twoFactorEnabled: false } });
}
