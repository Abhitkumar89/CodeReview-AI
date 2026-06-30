import { Router } from 'express';
import {
  createReview,
  getReviews,
  getReviewById,
  deleteReview,
  getStats,
} from '../controllers/reviewController.js';
import { createReviewValidator } from '../validators/reviewValidators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All review routes require authentication.
router.use(protect);

router.post('/review', reviewLimiter, createReviewValidator, validate, createReview);
router.get('/reviews', getReviews);
router.get('/reviews/stats', getStats);
router.get('/review/:id', getReviewById);
router.delete('/review/:id', deleteReview);

export default router;
