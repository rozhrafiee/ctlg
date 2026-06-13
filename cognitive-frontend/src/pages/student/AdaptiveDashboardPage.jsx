import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function AdaptiveDashboardPage() {
  const { fetchAdaptiveDashboard } = useAdaptive();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetchAdaptiveDashboard();
      setData(res);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="داشبورد تطبیقی" subtitle="مرور سریع وضعیت مسیر یادگیری" />
      <div className="card-grid text-sm">
        <div className="stat-card">
          <div className="text-xs text-slate-500">سطح</div>
          <div className="text-2xl font-bold">{data?.level ?? '-'}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500">تکمیل شده</div>
          <div className="text-2xl font-bold">{data?.completed_count ?? 0}</div>
        </div>
        <div className="stat-card">
          <div className="text-xs text-slate-500">مسیر فعال</div>
          <div className="text-2xl font-bold">{data?.active_path ? 'بله' : 'خیر'}</div>
        </div>
      </div>
    </div>
  );
}
