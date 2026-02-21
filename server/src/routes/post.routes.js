import express from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  retryPublish,
  schedulePost,
  rephraseCaption,
  copyrightCheck,
} from "../controllers/post.controller.js";

const router = express.Router();

// Use memory storage — files are buffered and then saved to MongoDB GridFS
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Only run multer for multipart/form-data requests (JSON posts skip file processing)
function optionalUpload(req, res, next) {
  if (req.is("multipart/form-data")) {
    return upload.array("media")(req, res, next);
  }
  next();
}

router.use(authenticate);

router.get("/", asyncHandler(listPosts));
router.get("/:id", asyncHandler(getPost));
router.post("/", optionalUpload, asyncHandler(createPost));
router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));
router.post("/rephrase", asyncHandler(rephraseCaption));
router.post("/copyright-check", asyncHandler(copyrightCheck));
router.post("/:id/publish", asyncHandler(publishPost));
router.post("/:id/retry", asyncHandler(retryPublish));
router.post("/:id/schedule", asyncHandler(schedulePost));

export default router;
