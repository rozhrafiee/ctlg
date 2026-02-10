import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/90 backdrop-blur">
      <div className="container-shell flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 min-w-0">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-neutral-600 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="منوی اصلی"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-neutral-900 truncate">{title}</h1>
            <p className="text-xs text-neutral-500 truncate">خوش آمدی، {user?.first_name || user?.username}</p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Button variant="primary" onClick={logout} className="w-full sm:w-auto">خروج</Button>
        </div>
      </div>
    </div>
  );
}
