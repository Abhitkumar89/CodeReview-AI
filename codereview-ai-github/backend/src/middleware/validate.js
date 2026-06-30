import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Runs an array of express-validator chains, then aggregates any errors into a
 * single 400 ApiError. Use after the validation chains in a route definition.
 */
export const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));

  return next(ApiError.badRequest('Validation failed', details));
};
