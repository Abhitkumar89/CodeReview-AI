import { body } from 'express-validator';
import { SUPPORTED_LANGUAGES } from '../models/Review.js';

export const createReviewValidator = [
  body('language')
    .trim()
    .toLowerCase()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  body('code')
    .isString()
    .withMessage('Code must be a string')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Code cannot be empty')
    .isLength({ max: 20000 })
    .withMessage('Code is too long (max 20,000 characters)'),
  body('title').optional().trim().isLength({ max: 120 }),
];
