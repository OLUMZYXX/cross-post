import express from "express";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// store uploaded files in memory and push into MongoDB (no local disk files)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

router.use(authenticate);

router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPost));
router.post("/", upload.array("media"), asyncHandler(createPost));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));
router.post("/:id/publish", asyncHandler(publishPost));
router.post("/:id/schedule", asyncHandler(schedulePost));

export default router;
