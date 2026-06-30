import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { reviewCode } from '../services/aiService.js';

const deriveTitle = (code) => {
  const firstLine = code.split('\n').find((l) => l.trim().length > 0) || 'Untitled review';
  return firstLine.trim().slice(0, 80);
};

/** POST /api/review — runs an AI review and persists it. */
export const createReview = asyncHandler(async (req, res) => {
  const { code, language, title } = req.body;

  const aiResponse = await reviewCode(language, code);

  const review = await Review.create({
    userId: req.user._id,
    language,
    originalCode: code,
    title: (title && title.trim()) || deriveTitle(code),
    aiResponse,
  });

  res.status(201).json({
    success: true,
    message: 'Code reviewed successfully',
    data: { review },
  });
});

/** GET /api/reviews — paginated, searchable list of the user's reviews. */
export const getReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { search, language } = req.query;

  const filter = { userId: req.user._id };
  if (language) filter.language = String(language).toLowerCase();
  if (search) {
    const rx = new RegExp(String(search).trim(), 'i');
    filter.$or = [{ title: rx }, { originalCode: rx }];
  }

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

/** GET /api/review/:id — a single review owned by the user. */
export const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');
  res.json({ success: true, data: { review } });
});

/** DELETE /api/review/:id */
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!review) throw ApiError.notFound('Review not found');
  res.json({ success: true, message: 'Review deleted' });
});

/** GET /api/reviews/stats — small summary for the dashboard header. */
export const getStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const [total, agg] = await Promise.all([
    Review.countDocuments({ userId }),
    Review.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgScore: { $avg: '$aiResponse.qualityScore' } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalReviews: total,
      averageScore: agg.length ? Math.round(agg[0].avgScore * 10) / 10 : 0,
    },
  });
});
