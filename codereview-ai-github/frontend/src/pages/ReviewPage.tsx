import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Eraser, Wand2, Keyboard } from 'lucide-react';
import { CodeEditor } from '@/components/CodeEditor';
import { ReviewResult } from '@/components/ReviewResult';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { reviewService } from '@/services/reviewService';
import { getApiErrorMessage } from '@/lib/api';
import { DRAFT_KEY, LANGUAGES, getLanguage } from '@/utils/constants';
import type { Language, Review } from '@/types';

interface Draft {
  code: string;
  language: Language;
}

export default function ReviewPage() {
  const { success, error, info } = useToast();
  const [draft, setDraft] = useLocalStorage<Draft>(DRAFT_KEY, {
    code: LANGUAGES[0].sample,
    language: 'javascript',
  });
  const [code, setCode] = useState(draft.code);
  const [language, setLanguage] = useState<Language>(draft.language);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Review | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Auto-save the draft locally (debounced via timeout).
  useEffect(() => {
    const id = setTimeout(() => {
      setDraft({ code, language });
      setSavedAt(new Date());
    }, 600);
    return () => clearTimeout(id);
  }, [code, language, setDraft]);

  const stats = useMemo(
    () => ({
      lines: code.split('\n').length,
      chars: code.length,
    }),
    [code],
  );

  const handleReview = async () => {
    if (!code.trim()) {
      error('Please enter some code to review');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const review = await reviewService.create({ code, language });
      setResult(review);
      success('Review complete!');
    } catch (err) {
      error(getApiErrorMessage(err, 'Failed to review code'));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    success('Code copied');
    setTimeout(() => setCopied(false), 1600);
  };

  const loadSample = () => {
    const sample = getLanguage(language).sample;
    setCode(sample);
    info('Loaded sample snippet');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">New Code Review</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paste your code, choose a language, and let the AI review it.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Keyboard className="h-3.5 w-3.5" />
          <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-mono dark:border-white/10">
            Ctrl
          </kbd>
          +
          <kbd className="rounded border border-slate-300 px-1.5 py-0.5 font-mono dark:border-white/10">
            Enter
          </kbd>
          to review
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor column */}
        <div className="flex flex-col gap-3">
          <div className="card flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 dark:border-white/5">
              <select
                className="input-base h-9 w-40 py-1"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <button onClick={loadSample} className="btn-ghost h-8 px-2 text-xs" title="Load sample">
                  <Wand2 className="h-3.5 w-3.5" /> Sample
                </button>
                <button onClick={() => setCode('')} className="btn-ghost h-8 px-2 text-xs" title="Clear">
                  <Eraser className="h-3.5 w-3.5" /> Clear
                </button>
                <button onClick={copyCode} className="btn-ghost h-8 px-2 text-xs" title="Copy code">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy
                </button>
              </div>
            </div>
            <div className="h-[460px]">
              <CodeEditor
                value={code}
                language={getLanguage(language).monaco}
                onChange={setCode}
                onSubmit={handleReview}
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-400 dark:border-white/5">
              <span>
                {stats.lines} lines · {stats.chars} chars
              </span>
              <span>
                {savedAt ? `Auto-saved at ${savedAt.toLocaleTimeString()}` : 'Draft auto-saves locally'}
              </span>
            </div>
          </div>

          <Button onClick={handleReview} loading={loading} className="w-full py-2.5">
            <Sparkles className="h-4 w-4" />
            {loading ? 'Reviewing your code...' : 'Review Code'}
          </Button>
        </div>

        {/* Result column */}
        <div>
          {loading ? (
            <LoadingState />
          ) : result ? (
            <ReviewResult review={result} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex h-full min-h-[460px] flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-500">
        <Sparkles className="h-7 w-7" />
      </span>
      <h3 className="text-lg font-semibold">Your review will appear here</h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Click <span className="font-medium text-brand-500">Review Code</span> to get a quality
        score, detected bugs, security issues, complexity analysis, and a cleaned-up rewrite.
      </p>
    </div>
  );
}

function LoadingState() {
  const lines = [70, 90, 50, 80, 60, 95, 40];
  return (
    <div className="card flex h-full min-h-[460px] flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/10 text-brand-500"
        >
          <Sparkles className="h-5 w-5" />
        </motion.span>
        <div>
          <p className="font-semibold">Analyzing your code…</p>
          <p className="text-sm text-slate-400">The AI is reviewing bugs, security & performance.</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {lines.map((w, i) => (
          <motion.div
            key={i}
            className="h-3 rounded-full bg-slate-200 dark:bg-white/10"
            style={{ width: `${w}%` }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.12 }}
          />
        ))}
      </div>
    </div>
  );
}
