import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { Errors } from "../utils/AppError.js";

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw Errors.unauthorized("Missing or invalid authorization header");
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(err);
  }
}
