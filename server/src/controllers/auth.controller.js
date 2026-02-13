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
