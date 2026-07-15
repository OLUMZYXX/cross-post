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
  const members = await User.find({ teamOwnerId: workspaceId, role: "member" })
    .select("name email createdAt")
    .sort({ createdAt: -1 });
  return members.map((member) => ({
    id: member._id,
    name: member.name,
    email: member.email,
    createdAt: member.createdAt,
  }));
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
  member.role = "owner";
  member.teamOwnerId = member._id;
  await member.save();
}
