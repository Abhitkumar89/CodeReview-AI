import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, Moon, Sun, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/review', label: 'New Review', icon: Sparkles },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#0a0a0f]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <Code2 className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">
            CodeReview <span className="text-brand-500">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="btn-ghost h-9 w-9 !p-0"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            to="/profile"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5"
            title="Profile"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: user?.avatarColor || '#6366f1' }}
            >
              {user?.name?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}
            </span>
            <span className="hidden text-sm font-medium sm:block">{user?.name}</span>
          </Link>

          <button onClick={handleLogout} className="btn-ghost h-9 w-9 !p-0" title="Log out" aria-label="Log out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
