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
