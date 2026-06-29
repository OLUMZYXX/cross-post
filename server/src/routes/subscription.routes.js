import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  revenuecatWebhook,
  getSubscriptionStatus,
} from "../controllers/subscription.controller.js";

const router = express.Router();

router.post("/webhook", asyncHandler(revenuecatWebhook));
router.get("/status", authenticate, asyncHandler(getSubscriptionStatus));

export default router;
