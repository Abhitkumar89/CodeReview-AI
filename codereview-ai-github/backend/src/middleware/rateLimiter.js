import rateLimit from 'express-rate-limit';

const message = {
  success: false,
  message: 'Too many requests, please try again later.',
};

/** Generous limiter applied to the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

/** Tighter limiter for auth endpoints to slow down brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message,
});

/** AI reviews are expensive, so keep this conservative per window. */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You are reviewing code too quickly. Please wait a moment.',
  },
});
