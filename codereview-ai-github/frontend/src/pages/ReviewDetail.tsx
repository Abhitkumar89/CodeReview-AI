import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Copy, Check } from 'lucide-react';
import { reviewService } from '@/services/reviewService';
import { ReviewResult } from '@/components/ReviewResult';
import { CodeEditor } from '@/components/CodeEditor';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { getApiErrorMessage } from '@/lib/api';
import { getLanguage } from '@/utils/constants';
import type { Review } from '@/types';

export default function ReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error, success } = useToast();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    reviewService
      .getById(id)
      .then(setReview)
      .catch((err) => {
        error(getApiErrorMessage(err, 'Review not found'));
        navigate('/dashboard');
      })
      .finally(() => setLoading(false));
  }, [id, error, navigate]);

  const handleDelete = async () => {
    if (!review) return;
    try {
      await reviewService.remove(review._id);
      success('Review deleted');
      navigate('/dashboard');
    } catch (err) {
      error(getApiErrorMessage(err, 'Failed to delete'));
    }
  };

  const copyOriginal = async () => {
    if (!review) return;
    await navigator.clipboard.writeText(review.originalCode);
    setCopied(true);
    success('Original code copied');
    setTimeout(() => setCopied(false), 1600);
  };

  if (loading) return <FullPageSpinner label="Loading review..." />;
  if (!review) return null;

  const lang = getLanguage(review.language);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/dashboard" className="btn-ghost h-9 px-3 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <Button variant="danger" className="h-9 px-3 text-sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div>
        <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          {lang.label}
        </span>
        <h1 className="mt-2 font-mono text-xl font-bold">{review.title}</h1>
        <p className="text-sm text-slate-400">
          Reviewed on {new Date(review.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 dark:border-white/5">
            <span className="text-sm font-medium text-slate-500">Original Code</span>
            <button onClick={copyOriginal} className="btn-ghost h-8 px-2 text-xs">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy
            </button>
          </div>
          <div className="h-[460px]">
            <CodeEditor
              value={review.originalCode}
              language={lang.monaco}
              onChange={() => {}}
              readOnly
            />
          </div>
        </div>

        <div className="lg:max-h-none">
          <ReviewResult review={review} />
        </div>
      </div>
    </div>
  );
}
