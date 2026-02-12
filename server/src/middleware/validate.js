import { Errors } from "../utils/AppError.js";

export function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      for (const rule of rules) {
        if (rule === "required" && (!value || (typeof value === "string" && !value.trim()))) {
          errors.push(`${field} is required`);
          break;
        }
        if (rule === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} must be a valid email`);
        }
        if (rule === "minLength:6" && value && value.length < 6) {
          errors.push(`${field} must be at least 6 characters`);
        }
        if (rule === "maxLength:500" && value && value.length > 500) {
          errors.push(`${field} must be at most 500 characters`);
        }
        if (rule === "array" && value && !Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        }
      }
    }

    if (errors.length > 0) {
      throw Errors.validation(errors.join(", "));
    }

    next();
  };
}
