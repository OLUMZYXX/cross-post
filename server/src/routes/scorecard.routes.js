import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  suggestTeams,
  composeScorecard,
} from "../controllers/scorecard.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/teams", asyncHandler(suggestTeams));
router.post("/compose", asyncHandler(composeScorecard));

export default router;
