import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

function getRank(level) {
  if (level >= 90) return 'الماس شناختی';
  if (level >= 75) return 'طلایی';
  if (level >= 50) return 'نقره‌ای';
  if (level >= 25) return 'برنزی';
  return 'نوآموز';
}

const RANK_TIERS = [
  { key: 'الماس شناختی', minLevel: 90, color: 'bg-sky-100 text-sky-800 border-sky-200', dot: 'bg-sky-500' },
  { key: 'طلایی', minLevel: 75, color: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
  { key: 'نقره‌ای', minLevel: 50, color: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-400' },
  { key: 'برنزی', minLevel: 25, color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
  { key: 'نوآموز', minLevel: 0, color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const { fetchStudentDashboard } = useAnalytics();
  const { markRecommendationClicked } = useAdaptive();
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [recExpandedId, setRecExpandedId] = useState(null);
  const [readRecIds, setReadRecIds] = useState(new Set());

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const res = await fetchStudentDashboard();
        setData(res);
      } catch {
        setLoadError('بارگذاری داشبورد ناموفق بود. لطفاً دوباره تلاش کنید.');
        setData(null);
      }
    };
    load();
  }, []);

  const level = data?.identity?.level ?? user?.cognitive_level ?? 1;
  const rank = data?.identity?.rank ?? getRank(level);
  const displayData = {
    identity: {
      full_name: data?.identity?.full_name ?? ([user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username),
      level,
      rank,
    },
    learning_status: data?.learning_status ?? null,
    top_recommendations: data?.top_recommendations ?? [],
    recent_test_results: data?.recent_test_results ?? [],
    alerts: loadError
      ? [{ type: 'warning', message: loadError }, ...(data?.alerts ?? [])]
      : (data?.alerts ?? []),
    chart_data: data?.chart_data ?? null,
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}
      <div className="surface p-6 border-primary/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">داشبورد شهروند</h2>
          <p className="text-sm text-neutral-500 mt-1">خلاصه مسیر یادگیری و وضعیت شناختی شما</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface p-5 border-r-4 border-primary stat-card">
          <div className="text-3xl font-extrabold text-primary">{displayData.identity.level}</div>
          <div className="text-xs text-neutral-500 mt-1">سطح</div>
          <div className="text-xs text-neutral-600 mt-0.5 font-medium">{displayData.identity.rank}</div>
        </div>
        <div className="surface p-5 border-r-4 border-secondary stat-card">
          <div className="text-3xl font-extrabold text-secondary">{displayData.learning_status?.progress_percent ?? 0}%</div>
          <div className="text-xs text-neutral-500 mt-1">مسیر فعال</div>
          <div className="text-xs text-neutral-600 mt-0.5">
            {displayData.learning_status?.completed_count ?? 0} / {displayData.learning_status?.total_count ?? 0}
          </div>
        </div>
        <div className="surface p-5 border-r-4 border-accent stat-card">
          <div className="text-3xl font-extrabold text-accent-dark">{displayData.alerts?.length ?? 0}</div>
          <div className="text-xs text-neutral-500 mt-1">هشدارها</div>
        </div>
      </div>

      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">سطح‌بندی رتبه‌ها</h3>
        <p className="text-sm text-neutral-500 mb-4">رتبه فعلی شما: <span className="font-semibold text-primary">{rank}</span></p>
        <div className="space-y-2">
          {RANK_TIERS.map((tier) => {
            const isCurrent = tier.key === rank;
            const range = tier.minLevel === 90 ? '۹۰ تا ۱۰۰' : tier.minLevel === 75 ? '۷۵ تا ۸۹' : tier.minLevel === 50 ? '۵۰ تا ۷۴' : tier.minLevel === 25 ? '۲۵ تا ۴۹' : '۱ تا ۲۴';
            return (
              <div
                key={tier.key}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${tier.color} ${isCurrent ? 'ring-2 ring-offset-1 ring-primary/40 font-semibold' : ''}`}
              >
                <span className={`h-3 w-3 rounded-full flex-shrink-0 ${tier.dot}`} />
                <span className="flex-1">{tier.key}</span>
                <span className="text-xs opacity-90">سطح {range}</span>
                {isCurrent && <span className="text-xs">(شما)</span>}
              </div>
            );
          })}
        </div>
      </Card>

      {displayData.chart_data && (
        <Card className="border-primary/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="section-title text-neutral-800 mb-0">نمودار پیشرفت</h3>
            <Link to="/student/progress">
              <Button variant="secondary">مشاهده نمودار کامل</Button>
            </Link>
          </div>
          <p className="text-sm text-neutral-500 mt-2">
            محتواهای خوانده‌شده: <span className="font-semibold text-primary">{displayData.chart_data.content_completed_count ?? 0}</span>
            {' · '}
            آزمون‌های داده‌شده: <span className="font-semibold text-secondary">{displayData.chart_data.tests_completed_count ?? 0}</span>
          </p>
        </Card>
      )}

      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">پیشنهادها</h3>
        <div className="space-y-3">
          {(displayData.top_recommendations || []).map((rec) => {
            const isExpanded = recExpandedId === rec.id;
            const isRead = rec.is_clicked || readRecIds.has(rec.id);
            const body = rec.content?.body;
            const hasBody = body && body.trim().length > 0;
            return (
              <div key={rec.id} className="rounded-xl bg-primary-soft/30 border border-primary/10 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => hasBody && setRecExpandedId(isExpanded ? null : rec.id)}
                  role={hasBody ? 'button' : undefined}
                  aria-expanded={isExpanded}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-neutral-900">{rec.content?.title}</div>
                    <div className="text-xs text-neutral-500 mt-1">{rec.recommendation_type}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {hasBody && (
                      <button
                        type="button"
                        className="text-xs text-neutral-500 hover:text-neutral-700 underline-offset-2 hover:underline"
                        onClick={() => setRecExpandedId(isExpanded ? null : rec.id)}
                      >
                        {isExpanded ? 'بستن' : 'باز کردن'}
                      </button>
                    )}
                    <Button
                      variant={isRead ? 'ghost' : 'secondary'}
                      className={isRead ? '!bg-emerald-100 !text-emerald-800 !border-emerald-200 cursor-default' : ''}
                      onClick={() => {
                        if (!isRead) {
                          markRecommendationClicked(rec.id);
                          setReadRecIds((s) => new Set([...s, rec.id]));
                        }
                      }}
                      disabled={isRead}
                    >
                      خوانده شد
                    </Button>
                  </div>
                </div>
                {hasBody && isExpanded && (
                  <div className="px-4 pb-4 pt-0 text-sm text-neutral-700 whitespace-pre-wrap border-t border-primary/10 mt-0 pt-3">
                    {body}
                  </div>
                )}
              </div>
            );
          })}
          {!displayData.top_recommendations?.length && (
            <div className="text-sm text-neutral-500">پیشنهادی ثبت نشده است.</div>
          )}
        </div>
      </Card>

      <Card className="border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">هشدارها</h3>
        <div className="space-y-2 text-sm">
          {(displayData.alerts || []).map((alert, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge tone={alert.type === 'critical' ? 'rose' : 'amber'}>{alert.type}</Badge>
              <span className="text-neutral-700">{alert.message}</span>
            </div>
          ))}
          {!displayData.alerts?.length && <div className="text-neutral-500">هشداری وجود ندارد.</div>}
        </div>
      </Card>
    </div>
  );
}
