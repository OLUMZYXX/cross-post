import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { Errors } from "../utils/AppError.js";
import {
  getMembers,
  addMember,
  deleteMember,
  cancelPendingInvite,
  getMyInvites,
  acceptTeamInvite,
  rejectTeamInvite,
  getPerformance,
} from "../controllers/team.controller.js";

const router = express.Router();

function requireTeamOwner(req, _res, next) {
  if ((req.user.role || "owner") !== "owner") {
    return next(Errors.forbidden("Only the team owner can manage the team"));
  }
  next();
}

router.use(authenticate);

router.get("/invites/pending", asyncHandler(getMyInvites));
router.post("/invites/:id/accept", asyncHandler(acceptTeamInvite));
router.post("/invites/:id/reject", asyncHandler(rejectTeamInvite));

router.use(requireTeamOwner);

router.get("/members", asyncHandler(getMembers));
router.post("/members", asyncHandler(addMember));
router.delete("/members/:id", asyncHandler(deleteMember));
router.delete("/invites/:id", asyncHandler(cancelPendingInvite));
router.get("/performance", asyncHandler(getPerformance));

export default router;
