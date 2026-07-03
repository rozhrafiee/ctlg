import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function RecommendationsPage() {
  const { fetchRecommendations, markRecommendationClicked } = useAdaptive();
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    const data = await fetchRecommendations();
    setItems(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (rec) => {
    await markRecommendationClicked(rec.id);
    setItems((prev) => prev.map((r) => (r.id === rec.id ? { ...r, is_clicked: true } : r)));
  };

  return (
    <div className="space-y-4">
      <PageHeader title="پیشنهادها" subtitle="محتواهای پیشنهادی برای شما" />
      {items.map((rec) => {
        const isExpanded = expandedId === rec.id;
        const isRead = rec.is_clicked;
        const body = rec.content?.body;
        const hasBody = body && body.trim().length > 0;
        return (
          <Card key={rec.id} className="overflow-hidden">
            <div
              className="flex items-center justify-between cursor-pointer py-1"
              onClick={() => hasBody && setExpandedId(isExpanded ? null : rec.id)}
              role={hasBody ? 'button' : undefined}
              aria-expanded={isExpanded}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-neutral-900">{rec.content?.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{rec.recommendation_type}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {hasBody && (
                  <button
                    type="button"
                    className="text-xs text-neutral-500 hover:text-neutral-700 underline-offset-2 hover:underline"
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  >
                    {isExpanded ? 'بستن' : 'باز کردن'}
                  </button>
                )}
                <Button
                  variant={isRead ? 'ghost' : 'secondary'}
                  className={isRead ? '!bg-emerald-100 !text-emerald-800 !border-emerald-200 cursor-default' : ''}
                  onClick={() => !isRead && handleMarkRead(rec)}
                  disabled={isRead}
                >
                  {isRead ? 'خوانده شد' : 'خوانده شد'}
                </Button>
              </div>
            </div>
            {hasBody && isExpanded && (
              <div className="mt-3 pt-3 border-t border-neutral-100 text-sm text-neutral-700 whitespace-pre-wrap">
                {body}
              </div>
            )}
          </Card>
        );
      })}
      {!items.length && <Card>پیشنهادی وجود ندارد.</Card>}
    </div>
  );
}
