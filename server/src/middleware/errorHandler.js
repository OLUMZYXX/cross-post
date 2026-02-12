import { AppError } from "../utils/AppError.js";

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Something went wrong";

  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Token has expired";
  }

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    code = "INVALID_JSON";
    message = "Invalid JSON in request body";
  }

  if (statusCode === 500 && !(err instanceof AppError)) {
    console.error("[Server Error]", err);
  }

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "ROUTE_NOT_FOUND"));
}
