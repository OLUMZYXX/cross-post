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
  confirmInstagramConnection,
} from "../controllers/instagram.oauth.js";
import {
  initiateTikTokAuth,
  handleTikTokCallback,
} from "../controllers/tiktok.oauth.js";
import {
  initiateLinkedInAuth,
  handleLinkedInCallback,
} from "../controllers/linkedin.oauth.js";
import {
  initiateYouTubeAuth,
  handleYouTubeCallback,
} from "../controllers/youtube.oauth.js";
import {
  initiateRedditAuth,
  handleRedditCallback,
} from "../controllers/reddit.oauth.js";

const router = express.Router();

// Callback routes (no auth required — user arrives here from the OAuth provider)
router.get("/auth/facebook/callback", asyncHandler(handleFacebookCallback));
router.get("/auth/twitter/callback", asyncHandler(handleTwitterCallback));
router.get("/auth/instagram/callback", asyncHandler(handleInstagramCallback));
router.get("/auth/tiktok/callback", asyncHandler(handleTikTokCallback));
router.get("/auth/linkedin/callback", asyncHandler(handleLinkedInCallback));
router.get("/auth/youtube/callback", asyncHandler(handleYouTubeCallback));
router.get("/auth/reddit/callback", asyncHandler(handleRedditCallback));

// Protected routes (require authentication)
router.use(authenticate);

router.get("/", asyncHandler(listPlatforms));
router.post("/connect", asyncHandler(connectPlatform));
router.delete("/:id", asyncHandler(disconnectPlatform));

router.get("/auth/facebook", asyncHandler(initiateFacebookAuth));
router.get("/auth/twitter", asyncHandler(initiateTwitterAuth));
router.get("/auth/instagram", asyncHandler(initiateInstagramAuth));
router.post("/auth/instagram/confirm", asyncHandler(confirmInstagramConnection));
router.get("/auth/tiktok", asyncHandler(initiateTikTokAuth));
router.get("/auth/linkedin", asyncHandler(initiateLinkedInAuth));
router.get("/auth/youtube", asyncHandler(initiateYouTubeAuth));
router.get("/auth/reddit", asyncHandler(initiateRedditAuth));

export default router;
