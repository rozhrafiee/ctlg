import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 1 });
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { fetchSystemReport, fetchEngagementMetrics, loading } = useAnalytics();
  const [stats, setStats] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const [systemData, engagementData] = await Promise.all([
          fetchSystemReport(),
          fetchEngagementMetrics().catch(() => null),
        ]);
        setStats(systemData);
        setEngagement(engagementData);
      } catch {
        setError('بارگذاری گزارش سیستم ناموفق بود.');
        setStats(null);
      }
    };
    load();
  }, []);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'مدیر سیستم';

  return (
    <div className="space-y-6">
      <div className="surface p-6 border-primary/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">نمای کلی سامانه</h2>
          <p className="text-sm text-neutral-500 mt-1">خوش آمدید، {displayName}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      {loading && !stats && !error && (
        <div className="text-sm text-neutral-500">در حال بارگذاری گزارش...</div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface p-5 border-r-4 border-primary stat-card">
          <div className="text-3xl font-extrabold text-primary">
            {formatNumber(stats?.total_citizens)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">کل شهروندان</div>
        </div>
        <div className="surface p-5 border-r-4 border-secondary stat-card">
          <div className="text-3xl font-extrabold text-secondary">
            {formatNumber(stats?.avg_system_level)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">میانگین سطح سیستم</div>
        </div>
        <div className="surface p-5 border-r-4 border-accent stat-card">
          <div className="text-3xl font-extrabold text-accent-dark">
            {formatNumber(stats?.tests_taken)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">آزمون‌های تکمیل‌شده</div>
        </div>
      </div>

      {engagement && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="surface p-5 border-r-4 border-emerald-500">
            <div className="text-3xl font-extrabold text-emerald-700">
              {formatNumber(engagement.active_count)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">شهروندان فعال</div>
          </div>
          <div className="surface p-5 border-r-4 border-rose-500">
            <div className="text-3xl font-extrabold text-rose-700">
              {formatNumber(engagement.abandoned_count)}
            </div>
            <div className="text-xs text-neutral-500 mt-1">در خطر ترک سامانه</div>
          </div>
        </div>
      )}

      <div className="surface p-6 border-neutral-200/80">
        <h3 className="section-title mb-4 text-center text-neutral-800">دسترسی سریع</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          <Link
            to="/manager/engagement"
            className="rounded-xl bg-primary-soft p-4 text-center text-primary font-medium hover:bg-primary/10 transition"
          >
            شاخص ماندگاری
          </Link>
          <Link
            to="/teacher/dashboard"
            className="rounded-xl bg-primary-soft p-4 text-center text-primary font-medium hover:bg-primary/10 transition"
          >
            داشبورد مدرس
          </Link>
          <Link
            to="/teacher/contents"
            className="rounded-xl bg-secondary-soft p-4 text-center text-secondary font-medium hover:bg-secondary/10 transition"
          >
            مدیریت محتوا
          </Link>
          <Link
            to="/teacher/grading"
            className="rounded-xl bg-primary p-4 text-center text-white font-medium hover:bg-primary-dark transition"
          >
            تصحیح پاسخ‌ها
          </Link>
        </div>
      </div>

      {engagement?.abandonment_rule?.description && (
        <Card className="border-primary/10">
          <h3 className="section-title mb-2 text-neutral-800">وضعیت ماندگاری</h3>
          <p className="text-sm text-neutral-600 leading-7">
            {engagement.abandonment_rule.description}
            {engagement.abandoned_count > 0 && (
              <>
                {' '}
                هم‌اکنون{' '}
                <Link to="/manager/engagement" className="text-primary font-medium hover:underline">
                  {formatNumber(engagement.abandoned_count)} شهروند
                </Link>{' '}
                در فهرست ترک‌کرده هستند.
              </>
            )}
          </p>
        </Card>
      )}
    </div>
  );
}
