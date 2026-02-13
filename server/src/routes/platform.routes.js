import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listPlatforms,
  connectPlatform,
  disconnectPlatform,
  initiateFacebookAuth,
  handleFacebookCallback,
} from "../controllers/platform.controller.js";
import {
  initiateTwitterAuth,
  handleTwitterCallback,
} from "../controllers/twitter.oauth.js";
import {
  initiateInstagramAuth,
  handleInstagramCallback,
} from "../controllers/instagram.oauth.js";
import {
  initiateTikTokAuth,
  handleTikTokCallback,
} from "../controllers/tiktok.oauth.js";

const router = express.Router();

router.get("/auth/facebook/callback", asyncHandler(handleFacebookCallback));
router.get("/auth/twitter/callback", asyncHandler(handleTwitterCallback));
router.get("/auth/instagram/callback", asyncHandler(handleInstagramCallback));
router.get("/auth/tiktok/callback", asyncHandler(handleTikTokCallback));

router.use(authenticate);

router.get("/", asyncHandler(listPlatforms));
router.post("/connect", asyncHandler(connectPlatform));
router.delete("/:id", asyncHandler(disconnectPlatform));

router.get("/auth/facebook", asyncHandler(initiateFacebookAuth));
router.get("/auth/twitter", asyncHandler(initiateTwitterAuth));
router.get("/auth/instagram", asyncHandler(initiateInstagramAuth));
router.get("/auth/tiktok", asyncHandler(initiateTikTokAuth));

export default router;
