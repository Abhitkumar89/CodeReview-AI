import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-bold text-brand-500">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button>
          <Home className="h-4 w-4" /> Back home
        </Button>
      </Link>
    </div>
  );
}
