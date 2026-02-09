import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';

export default function RecommendedPage() {
  const { fetchRecommended } = useAdaptive();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchRecommended();
      setItems(data || []);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="پیشنهادهای هوشمند" subtitle="محتواهای ویژه بر اساس تحلیل شناختی" />
      {items.map((rec) => (
        <Card key={rec.id}>
          <div className="font-semibold">{rec.content?.title}</div>
          <div className="text-xs text-slate-500">{rec.recommendation_type}</div>
        </Card>
      ))}
      {!items.length && <Card>پیشنهادی وجود ندارد.</Card>}
    </div>
  );
}
