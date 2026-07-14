import User from "../models/User.js";
import { Errors } from "../utils/AppError.js";

export function getWorkspaceId(user) {
  return (user.teamOwnerId || user._id).toString();
}

export async function getTeamUserIds(workspaceId) {
  const members = await User.find({
    $or: [{ teamOwnerId: workspaceId }, { _id: workspaceId }],
  }).select("_id");
  return members.map((member) => member._id);
}

export async function listMembers(workspaceId) {
  return User.find({ teamOwnerId: workspaceId, role: "member" })
    .select("name email createdAt")
    .sort({ createdAt: -1 });
}

export async function createMember(workspaceId, { name, email, password }) {
  if (!name || !email || !password) {
    throw Errors.badRequest("Name, email and password are required");
  }
  if (password.length < 6) {
    throw Errors.badRequest("Password must be at least 6 characters");
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw Errors.conflict("A user with this email already exists");
  }

  const member = new User({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "member",
    teamOwnerId: workspaceId,
  });
  await member.save();

  return { id: member._id, name: member.name, email: member.email };
}

export async function removeMember(workspaceId, memberId) {
  const member = await User.findOne({
    _id: memberId,
    teamOwnerId: workspaceId,
    role: "member",
  });
  if (!member) {
    throw Errors.notFound("Team member not found");
  }
  await User.deleteOne({ _id: member._id });
}
