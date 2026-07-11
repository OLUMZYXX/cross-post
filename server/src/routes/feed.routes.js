import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { footballFeed } from "../controllers/feed.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/football", asyncHandler(footballFeed));

export default router;
