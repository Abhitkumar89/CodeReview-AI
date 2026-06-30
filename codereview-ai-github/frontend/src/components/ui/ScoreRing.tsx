import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number; // 0 - 10
  size?: number;
}

function colorFor(score: number) {
  if (score >= 8) return '#10b981';
  if (score >= 5) return '#f59e0b';
  return '#ef4444';
}

export function ScoreRing({ score, size = 120 }: ScoreRingProps) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(10, score)) / 10;
  const color = colorFor(score);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-xs text-slate-400">/ 10</span>
      </div>
    </div>
  );
}
