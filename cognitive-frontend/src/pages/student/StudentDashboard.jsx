import { useEffect, useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';

export default function StudentDashboard() {
  const { fetchStudentDashboard } = useAnalytics();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchStudentDashboard();
      setData(res);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد دانش‌آموز"
        subtitle="خلاصه مسیر یادگیری و وضعیت شناختی شما"
      />
      <div className="card-grid text-sm">
        <div className="stat-card">
          <div className="text-xs text-slate-500">سطح</div>
          <div className="text-2xl font-bold">{data?.identity?.level ?? '-'}</div>
          <div className="text-xs text-slate-500">{data?.identity?.rank}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500">مسیر فعال</div>
          <div className="text-2xl font-bold">{data?.learning_status?.progress_percent ?? 0}%</div>
          <div className="text-xs text-slate-500">
            {data?.learning_status?.completed_count ?? 0} / {data?.learning_status?.total_count ?? 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500">هشدارها</div>
          <div className="text-2xl font-bold">{data?.alerts?.length ?? 0}</div>
        </div>
      </div>

      <Card>
        <h3 className="section-title mb-3">پیشنهادها</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {(data?.top_recommendations || []).map((rec) => (
            <div key={rec.id} className="rounded-xl bg-slate-50 p-4 text-sm">
              <div className="font-semibold">{rec.content?.title}</div>
              <div className="text-xs text-slate-500">{rec.recommendation_type}</div>
            </div>
          ))}
          {!data?.top_recommendations?.length && (
            <div className="text-sm text-slate-500">پیشنهادی ثبت نشده است.</div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="section-title mb-3">هشدارها</h3>
        <div className="space-y-2 text-sm">
          {(data?.alerts || []).map((alert, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Badge tone={alert.type === 'critical' ? 'rose' : 'amber'}>{alert.type}</Badge>
              <span>{alert.message}</span>
            </div>
          ))}
          {!data?.alerts?.length && <div className="text-slate-500">هشداری وجود ندارد.</div>}
        </div>
      </Card>
    </div>
  );
}
