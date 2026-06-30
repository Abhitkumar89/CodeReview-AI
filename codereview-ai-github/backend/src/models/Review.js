import mongoose from 'mongoose';

export const SUPPORTED_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'go'];

/**
 * Structured AI response. Kept flexible so the platform keeps working even if
 * the model returns partial data, but the common fields are typed explicitly.
 */
const aiResponseSchema = new mongoose.Schema(
  {
    qualityScore: { type: Number, min: 0, max: 10, default: 0 },
    summary: { type: String, default: '' },
    bugs: { type: [String], default: [] },
    securityIssues: { type: [String], default: [] },
    performanceImprovements: { type: [String], default: [] },
    readabilitySuggestions: { type: [String], default: [] },
    bestPractices: { type: [String], default: [] },
    cleanedCode: { type: String, default: '' },
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
  },
  { _id: false },
);

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: 'Untitled review',
      maxlength: 120,
    },
    language: {
      type: String,
      required: true,
      enum: SUPPORTED_LANGUAGES,
    },
    originalCode: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: aiResponseSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ title: 'text', originalCode: 'text' });

export const Review = mongoose.model('Review', reviewSchema);
