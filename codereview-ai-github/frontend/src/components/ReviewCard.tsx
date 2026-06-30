import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Clock, ArrowUpRight } from 'lucide-react';
import { getLanguage } from '@/utils/constants';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onDelete: (id: string) => void;
}

function scoreColor(score: number) {
  if (score >= 8) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  if (score >= 5) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  return 'bg-red-500/10 text-red-600 dark:text-red-400';
}

export function ReviewCard({ review, onDelete }: ReviewCardProps) {
  const lang = getLanguage(review.language);
  const ai = review.aiResponse;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card group flex flex-col p-4 transition hover:border-brand-400/60 hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          {lang.label}
        </span>
        <span className={`badge ${scoreColor(ai.qualityScore)}`}>{ai.qualityScore}/10</span>
      </div>

      <Link to={`/review/${review._id}`} className="block">
        <h3 className="line-clamp-1 font-mono text-sm font-semibold text-slate-800 group-hover:text-brand-600 dark:text-slate-100">
          {review.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {ai.summary || 'No summary available.'}
        </p>
      </Link>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          {new Date(review.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-1">
          <Link
            to={`/review/${review._id}`}
            className="btn-ghost h-8 px-2 text-xs"
            title="Open review"
          >
            Open <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => onDelete(review._id)}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-500"
            title="Delete review"
            aria-label="Delete review"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
