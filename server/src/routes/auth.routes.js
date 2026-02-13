import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { signup, signin, me, updateProfile } from "../controllers/auth.controller.js";
import { googleAuth, appleAuth } from "../controllers/social.auth.controller.js";

const router = express.Router();

router.post(
  "/signup",
  validate({
    name: ["required"],
    email: ["required", "email"],
    password: ["required", "minLength:6"],
  }),
  asyncHandler(signup),
);

router.post(
  "/signin",
  validate({
    email: ["required", "email"],
    password: ["required"],
  }),
  asyncHandler(signin),
);

router.get("/me", authenticate, asyncHandler(me));

router.post("/google", asyncHandler(googleAuth));
router.post("/apple", asyncHandler(appleAuth));

router.put(
  "/profile",
  authenticate,
  validate({
    name: ["required"],
    email: ["required", "email"],
  }),
  asyncHandler(updateProfile),
);

export default router;
