import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bug,
  ShieldAlert,
  Zap,
  Eye,
  CheckCircle2,
  Clock,
  Database,
  Copy,
  Check,
  Download,
  FileText,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Markdown } from '@/components/ui/Markdown';
import { downloadReviewPdf } from '@/utils/pdf';
import { useToast } from '@/context/ToastContext';
import { getLanguage } from '@/utils/constants';
import type { Review } from '@/types';

interface SectionConfig {
  key: keyof Pick<
    Review['aiResponse'],
    'bugs' | 'securityIssues' | 'performanceImprovements' | 'readabilitySuggestions' | 'bestPractices'
  >;
  title: string;
  icon: ReactNode;
  accent: string;
}

const SECTIONS: SectionConfig[] = [
  { key: 'bugs', title: 'Bugs Found', icon: <Bug className="h-4 w-4" />, accent: 'text-red-500' },
  {
    key: 'securityIssues',
    title: 'Security Issues',
    icon: <ShieldAlert className="h-4 w-4" />,
    accent: 'text-orange-500',
  },
  {
    key: 'performanceImprovements',
    title: 'Performance',
    icon: <Zap className="h-4 w-4" />,
    accent: 'text-amber-500',
  },
  {
    key: 'readabilitySuggestions',
    title: 'Readability',
    icon: <Eye className="h-4 w-4" />,
    accent: 'text-sky-500',
  },
  {
    key: 'bestPractices',
    title: 'Best Practices',
    icon: <CheckCircle2 className="h-4 w-4" />,
    accent: 'text-emerald-500',
  },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    success('Cleaned code copied to clipboard');
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
      <div className="flex items-center justify-between bg-slate-100 px-3 py-2 dark:bg-white/5">
        <span className="font-mono text-xs text-slate-500">{getLanguage(language).label}</span>
        <button onClick={copy} className="btn-ghost h-7 px-2 text-xs">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-96 overflow-auto bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function ReviewResult({ review }: { review: Review }) {
  const ai = review.aiResponse;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
      {/* Score + summary */}
      <motion.div variants={item} className="card flex flex-col items-center gap-5 p-5 sm:flex-row">
        <ScoreRing score={ai.qualityScore} />
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Overall Assessment</h2>
            <button
              onClick={() => downloadReviewPdf(review)}
              className="btn-secondary h-8 px-3 text-xs"
            >
              <Download className="h-3.5 w-3.5" /> PDF
            </button>
          </div>
          <Markdown>{ai.summary || '_No summary provided._'}</Markdown>
        </div>
      </motion.div>

      {/* Complexity */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/10 text-brand-500">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Time Complexity</p>
            <p className="font-mono text-sm font-semibold">{ai.timeComplexity || 'N/A'}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500/10 text-brand-500">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Space Complexity</p>
            <p className="font-mono text-sm font-semibold">{ai.spaceComplexity || 'N/A'}</p>
          </div>
        </div>
      </motion.div>

      {/* Findings */}
      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => {
          const items = ai[section.key];
          return (
            <motion.div variants={item} key={section.key} className="card p-4">
              <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${section.accent}`}>
                {section.icon}
                {section.title}
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-white/10">
                  {items.length}
                </span>
              </h3>
              {items.length ? (
                <ul className="flex flex-col gap-2">
                  {items.map((entry, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${section.accent}`} />
                      <div className="flex-1">
                        <Markdown>{entry}</Markdown>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">Nothing flagged here. 🎉</p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Cleaned code */}
      {ai.cleanedCode && (
        <motion.div variants={item} className="card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-500">
            <FileText className="h-4 w-4" /> Cleaned-up Code
          </h3>
          <CodeBlock code={ai.cleanedCode} language={review.language} />
        </motion.div>
      )}
    </motion.div>
  );
}
