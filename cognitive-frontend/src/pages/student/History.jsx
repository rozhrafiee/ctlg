import { useEffect, useState } from 'react';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function History() {
  const { fetchHistory } = useAssessment();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchHistory();
      setItems(data || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="تاریخچه آزمون‌ها" subtitle="سوابق آزمون‌های انجام شده" />
      {items.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{item.test_title}</div>
            <div className="text-xs text-slate-500">وضعیت: {item.status}</div>
          </div>
          <div className="text-sm text-slate-600">{item.total_score ?? '-'}</div>
        </Card>
      ))}
      {!items.length && <Card>تاریخچه‌ای وجود ندارد.</Card>}
    </div>
  );
}
