import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { Errors } from "../utils/AppError.js";
import {
  getMembers,
  addMember,
  deleteMember,
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
router.use(requireTeamOwner);

router.get("/members", asyncHandler(getMembers));
router.post("/members", asyncHandler(addMember));
router.delete("/members/:id", asyncHandler(deleteMember));
router.get("/performance", asyncHandler(getPerformance));

export default router;
