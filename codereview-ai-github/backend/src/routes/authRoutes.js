import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidators.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);

export default router;
