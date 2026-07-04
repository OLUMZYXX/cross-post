import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  saveScorecardTemplate,
  composeScorecard,
} from "../controllers/scorecard.controller.js";

const router = express.Router();

router.use(authenticate);

router.put("/template", asyncHandler(saveScorecardTemplate));
router.post("/compose", asyncHandler(composeScorecard));

export default router;
