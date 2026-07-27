import { useEffect, useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 1 });
}

export default function ManagerDashboard() {
  const { fetchSystemReport, loading } = useAnalytics();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const data = await fetchSystemReport();
        setStats(data);
      } catch {
        setError('بارگذاری گزارش سیستم ناموفق بود.');
        setStats(null);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد مدیر سیستم"
        subtitle="آمار کلان شهروندان و فعالیت آزمون‌ها"
      />

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

      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">جزئیات گزارش</h3>
        <p className="text-sm text-neutral-600 leading-7">
          این داشبورد از{' '}
          <code className="text-xs bg-primary-soft px-1.5 py-0.5 rounded">GET /analytics/system-report/</code>{' '}
          تغذیه می‌شود و فقط برای نقش مدیر در دسترس است. مدرسان می‌توانند از داشبورد معلم گزارش تک‌شهروند را ببینند.
        </p>
      </Card>
    </div>
  );
}
