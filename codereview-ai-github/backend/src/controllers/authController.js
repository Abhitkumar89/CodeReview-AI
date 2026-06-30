import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

const randomColor = () => {
  const palette = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];
  return palette[Math.floor(Math.random() * palette.length)];
};

/** POST /api/auth/register */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    throw ApiError.conflict('An account with that email already exists');
  }

  const user = await User.create({ name, email, password, avatarColor: randomColor() });
  const token = generateToken({ id: user._id });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user, token },
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken({ id: user._id });

  res.json({
    success: true,
    message: 'Logged in successfully',
    data: { user, token },
  });
});

/** GET /api/auth/me */
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

/** PATCH /api/auth/me */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatarColor } = req.body;
  if (typeof name === 'string' && name.trim()) req.user.name = name.trim();
  if (typeof avatarColor === 'string') req.user.avatarColor = avatarColor;
  await req.user.save();
  res.json({ success: true, message: 'Profile updated', data: { user: req.user } });
});
