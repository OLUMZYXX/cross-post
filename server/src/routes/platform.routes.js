import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listPlatforms,
  connectPlatform,
  disconnectPlatform,
} from "../controllers/platform.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", asyncHandler(listPlatforms));
router.post("/connect", asyncHandler(connectPlatform));
router.delete("/:id", asyncHandler(disconnectPlatform));

export default router;
