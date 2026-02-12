export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || "ERROR";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const Errors = {
  badRequest: (message = "Bad request") =>
    new AppError(message, 400, "BAD_REQUEST"),

  unauthorized: (message = "Not authenticated") =>
    new AppError(message, 401, "UNAUTHORIZED"),

  forbidden: (message = "Not authorized to perform this action") =>
    new AppError(message, 403, "FORBIDDEN"),

  notFound: (message = "Resource not found") =>
    new AppError(message, 404, "NOT_FOUND"),

  conflict: (message = "Resource already exists") =>
    new AppError(message, 409, "CONFLICT"),

  validation: (message = "Validation failed") =>
    new AppError(message, 422, "VALIDATION_ERROR"),

  internal: (message = "Something went wrong") =>
    new AppError(message, 500, "INTERNAL_ERROR"),
};
