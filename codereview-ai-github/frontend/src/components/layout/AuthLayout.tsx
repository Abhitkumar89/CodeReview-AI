import { motion } from 'framer-motion';
import { Code2, Sparkles, ShieldCheck, Gauge } from 'lucide-react';
import type { ReactNode } from 'react';

const highlights = [
  { icon: Sparkles, text: 'AI-powered reviews in seconds' },
  { icon: ShieldCheck, text: 'Security & bug detection' },
  { icon: Gauge, text: 'Time & space complexity analysis' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
            <Code2 className="h-5 w-5" />
          </span>
          <span className="text-xl">CodeReview AI</span>
        </div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-4xl font-bold leading-tight"
          >
            Write better code with an AI reviewer on your side.
          </motion.h1>
          <p className="mt-4 max-w-md text-white/70">
            Paste your code, pick a language, and get an instant senior-level review — bugs,
            security, performance, and a cleaned-up rewrite.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/90">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4" />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/50">Inspired by Linear, Vercel & GitHub.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
