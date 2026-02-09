import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function RecommendationsPage() {
  const { fetchRecommendations, markRecommendationClicked } = useAdaptive();
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await fetchRecommendations();
    setItems(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="پیشنهادها" subtitle="محتواهای پیشنهادی برای شما" />
      {items.map((rec) => (
        <Card key={rec.id} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{rec.content?.title}</div>
            <div className="text-xs text-slate-500">{rec.recommendation_type}</div>
          </div>
          <Button
            variant="secondary"
            onClick={async () => { await markRecommendationClicked(rec.id); load(); }}
          >
            دیدم
          </Button>
        </Card>
      ))}
      {!items.length && <Card>پیشنهادی وجود ندارد.</Card>}
    </div>
  );
}
