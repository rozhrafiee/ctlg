import { useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminEngagementPage() {
  const { fetchEngagementMetrics } = useAnalytics();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | abandoned | active

  useEffect(() => {
    const load = async () => {
      setError(null);
      try {
        const res = await fetchEngagementMetrics();
        setData(res);
      } catch {
        setError('بارگذاری شاخص‌های ماندگاری ناموفق بود. فقط مدیر سیستم دسترسی دارد.');
        setData(null);
      }
    };
    load();
  }, []);

  const rows = useMemo(() => {
    const list = data?.citizens ?? [];
    if (filter === 'abandoned') return list.filter((c) => c.abandoned);
    if (filter === 'active') return list.filter((c) => !c.abandoned);
    return list;
  }, [data, filter]);

  return (
    <div className="space-y-6">
      <div className="surface p-6 border-primary/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">پنل مدیریت — شاخص‌های مدل ترک سیستم</h2>
          <p className="text-sm text-neutral-500 mt-1">
            فیلدهای CSV آموزش مدل: فاصله ورود، مدت استفاده، آزمون ناموفق، نرخ پیشرفت، ترک
          </p>
          {data?.abandonment_rule?.description && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-3 inline-block">
              معیار ترک‌کرده: {data.abandonment_rule.description}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface p-5 border-r-4 border-primary">
          <div className="text-3xl font-extrabold text-primary">{data?.total_citizens ?? '—'}</div>
          <div className="text-xs text-neutral-500 mt-1">کل شهروندان</div>
        </div>
        <div className="surface p-5 border-r-4 border-emerald-500">
          <div className="text-3xl font-extrabold text-emerald-700">{data?.active_count ?? '—'}</div>
          <div className="text-xs text-neutral-500 mt-1">فعال</div>
        </div>
        <div className="surface p-5 border-r-4 border-rose-500">
          <div className="text-3xl font-extrabold text-rose-700">{data?.abandoned_count ?? '—'}</div>
          <div className="text-xs text-neutral-500 mt-1">ترک‌کرده</div>
        </div>
      </div>

      <Card className="border-primary/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="section-title mb-0 text-neutral-800">جدول شهروندان</h3>
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'همه' },
              { key: 'active', label: 'فعال' },
              { key: 'abandoned', label: 'ترک‌کرده' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  filter === opt.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-neutral-600 border-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-right text-neutral-500 border-b border-neutral-200">
                <th className="py-2 px-2 font-medium">شهروند</th>
                <th className="py-2 px-2 font-medium">سطح</th>
                <th className="py-2 px-2 font-medium">روز بی‌فعالیتی</th>
                <th className="py-2 px-2 font-medium">فاصله ورود (روز)</th>
                <th className="py-2 px-2 font-medium">مدت استفاده (دقیقه)</th>
                <th className="py-2 px-2 font-medium">آزمون ناموفق</th>
                <th className="py-2 px-2 font-medium">نرخ پیشرفت</th>
                <th className="py-2 px-2 font-medium">حساب</th>
                <th className="py-2 px-2 font-medium">ترک</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.user_id} className="border-b border-neutral-100">
                  <td className="py-2.5 px-2">
                    <div className="font-medium text-neutral-800">{c.display_name}</div>
                    <div className="text-xs text-neutral-400">{c.username}</div>
                  </td>
                  <td className="py-2.5 px-2 font-semibold text-primary">{c.cognitive_level}</td>
                  <td className="py-2.5 px-2">{Number(c.days_inactive ?? 0).toFixed(1)}</td>
                  <td className="py-2.5 px-2">{Number(c.avg_login_interval_days ?? 0).toFixed(1)}</td>
                  <td className="py-2.5 px-2">{Number(c.duration_of_use_minutes ?? 0).toFixed(0)}</td>
                  <td className="py-2.5 px-2">{c.failed_tests_count ?? 0}</td>
                  <td className="py-2.5 px-2">{Math.round(Number(c.progress_rate ?? 0) * 100)}%</td>
                  <td className="py-2.5 px-2">
                    <Badge tone={c.is_active === false ? 'rose' : 'teal'}>
                      {c.is_active === false ? 'غیرفعال' : 'فعال'}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-2">
                    <Badge tone={c.abandoned ? 'rose' : 'teal'}>
                      {c.abandoned ? 'ترک‌کرده' : 'مانده'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-neutral-500">
                    داده‌ای برای نمایش نیست.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
