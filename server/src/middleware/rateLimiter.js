import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const userKeyGenerator = (req) => req.user?.id || ipKeyGenerator(req) || "anonymous";

export const publishLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 1,
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: { message: "Please wait before publishing again.", code: "RATE_LIMIT" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const createLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 80,
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: { message: "Too many posts created. Try again later.", code: "RATE_LIMIT" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const rephraseLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 100,
  keyGenerator: userKeyGenerator,
  message: {
    success: false,
    error: { message: "Rephrase limit reached. Try again later.", code: "RATE_LIMIT" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
