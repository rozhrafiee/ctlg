import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function ProgressPage() {
  const { fetchProgress } = useAdaptive();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchProgress();
      setItems(data || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="پیشرفت من" subtitle="وضعیت تکمیل محتواها" />
      {items.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{item.content_title}</div>
            <div className="text-xs text-slate-500">آخرین دسترسی: {item.last_accessed}</div>
          </div>
          <div className="text-sm font-semibold">{Math.round(item.progress_percent)}%</div>
        </Card>
      ))}
      {!items.length && <Card>پیشرفتی ثبت نشده است.</Card>}
    </div>
  );
}
