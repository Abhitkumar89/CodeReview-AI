import { Loader2 } from 'lucide-react';

export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} />;
}

export function FullPageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
      <Spinner className="h-8 w-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
