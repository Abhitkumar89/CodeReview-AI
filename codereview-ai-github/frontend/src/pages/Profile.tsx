import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authService } from '@/services/authService';
import { reviewService } from '@/services/reviewService';
import { getApiErrorMessage } from '@/lib/api';
import type { ReviewStats } from '@/types';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [color, setColor] = useState(user?.avatarColor ?? COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);

  useEffect(() => {
    reviewService.stats().then(setStats).catch(() => {});
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await authService.updateProfile({ name, avatarColor: color });
      updateUser(updated);
      success('Profile updated');
    } catch (err) {
      error(getApiErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card flex items-center gap-4 p-6"
      >
        <span
          className="grid h-16 w-16 place-items-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {name.charAt(0).toUpperCase() || 'U'}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-semibold">{user.name}</h2>
          <p className="flex items-center gap-1.5 text-sm text-slate-400">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-slate-400">
            <Calendar className="h-3.5 w-3.5" /> Joined{' '}
            {new Date(user.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-brand-500">{stats?.totalReviews ?? '—'}</p>
          <p className="text-sm text-slate-400">Total reviews</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-brand-500">
            {stats ? `${stats.averageScore}/10` : '—'}
          </p>
          <p className="text-sm text-slate-400">Average score</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-6">
        <h3 className="font-semibold">Edit profile</h3>
        <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Avatar color</p>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-full transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0f]' : ''
                }`}
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>
        <div>
          <Button type="submit" loading={saving}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
