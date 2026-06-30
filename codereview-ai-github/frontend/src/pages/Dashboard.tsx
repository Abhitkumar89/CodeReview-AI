import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Plus, FileCode, Star, Inbox } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/lib/api';
import { LANGUAGES } from '@/utils/constants';
import { ReviewCard } from '@/components/ReviewCard';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import type { Language, Review, ReviewStats } from '@/types';

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/10 text-brand-500">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { error, success } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalReviews: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [language, setLanguage] = useState<Language | ''>('');
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, s] = await Promise.all([
        reviewService.list({ search: debouncedSearch, language, limit: 50 }),
        reviewService.stats(),
      ]);
      setReviews(list.items);
      setStats(s);
    } catch (err) {
      error(getApiErrorMessage(err, 'Failed to load reviews'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, language, error]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    const prev = reviews;
    setReviews((r) => r.filter((rev) => rev._id !== id));
    try {
      await reviewService.remove(id);
      success('Review deleted');
      setStats((s) => ({ ...s, totalReviews: Math.max(0, s.totalReviews - 1) }));
    } catch (err) {
      setReviews(prev);
      error(getApiErrorMessage(err, 'Failed to delete review'));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your previous AI code reviews.
          </p>
        </div>
        <Link to="/review">
          <Button>
            <Plus className="h-4 w-4" /> New Review
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<FileCode className="h-5 w-5" />} label="Total Reviews" value={stats.totalReviews} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Average Score" value={`${stats.averageScore}/10`} />
        <StatCard
          icon={<Inbox className="h-5 w-5" />}
          label="Languages Used"
          value={new Set(reviews.map((r) => r.language)).size}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input-base pl-9"
            placeholder="Search by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-base sm:w-48"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language | '')}
        >
          <option value="">All languages</option>
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card flex flex-col items-center gap-3 py-16 text-center"
        >
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
            <FileCode className="h-7 w-7" />
          </span>
          <h3 className="text-lg font-semibold">No reviews yet</h3>
          <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {debouncedSearch || language
              ? 'No reviews match your filters. Try adjusting them.'
              : 'Run your first AI code review to see it appear here.'}
          </p>
          <Link to="/review">
            <Button className="mt-2">
              <Plus className="h-4 w-4" /> Start a review
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
