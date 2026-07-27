import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMl } from '../hooks/useMl';

export default function RetentionBanner() {
  const { user } = useAuth();
  const { fetchChurn, fetchNotifications, dismissNotification } = useMl();
  const [notification, setNotification] = useState(null);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') return;

    let cancelled = false;

    const load = async () => {
      try {
        await fetchChurn().catch(() => null);
        const list = await fetchNotifications().catch(() => []);
        if (cancelled) return;
        const undismissed = Array.isArray(list)
          ? list.find((n) => n && !n.is_dismissed)
          : null;
        setNotification(undismissed || null);
      } catch {
        if (!cancelled) setNotification(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.role, user?.id]);

  if (!notification?.message) return null;

  const onDismiss = async () => {
    if (dismissing) return;
    setDismissing(true);
    try {
      await dismissNotification(notification.id);
      setNotification(null);
    } catch {
      setDismissing(false);
    }
  };

  return (
    <div
      className="mb-6 rounded-xl border border-amber-200/80 bg-gradient-to-l from-amber-50 to-teal-50 px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center gap-3"
      role="status"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900/90">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        disabled={dismissing}
        className="shrink-0 self-start sm:self-center rounded-lg px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white/70 border border-teal-200/80 hover:bg-white transition disabled:opacity-60"
      >
        {dismissing ? '...' : 'متوجه شدم'}
      </button>
    </div>
  );
}
