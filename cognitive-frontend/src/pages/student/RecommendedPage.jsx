import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

function asList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function RecommendedPage() {
  const { fetchRecommended, markRecommendationClicked } = useAdaptive();
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [pendingId, setPendingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchRecommended();
        if (!cancelled) setItems(asList(data));
      } catch (err) {
        if (!cancelled) setError('بارگذاری پیشنهادها ناموفق بود.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // intentionally once on mount; hook fn identity changes every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (rec) => {
    if (rec.is_clicked || pendingId === rec.id) return;
    setError(null);
    setPendingId(rec.id);
    setItems((prev) => prev.map((r) => (r.id === rec.id ? { ...r, is_clicked: true } : r)));
    try {
      await markRecommendationClicked(rec.id);
    } catch (err) {
      setItems((prev) => prev.map((r) => (r.id === rec.id ? { ...r, is_clicked: false } : r)));
      setError('ثبت «خوانده شد» ناموفق بود. دوباره تلاش کنید.');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="پیشنهادهای هوشمند" subtitle="محتواهای ویژه بر اساس تحلیل شناختی" />
      {error && (
        <Card className="text-sm text-red-700 bg-red-50 border border-red-100">{error}</Card>
      )}
      {items.map((rec) => {
        const isExpanded = expandedId === rec.id;
        const isRead = rec.is_clicked;
        const body = rec.content?.body;
        const hasBody = body && body.trim().length > 0;
        const isPending = pendingId === rec.id;

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
                  type="button"
                  variant={isRead ? 'ghost' : 'secondary'}
                  className={isRead ? '!bg-emerald-100 !text-emerald-800 !border-emerald-200 cursor-default' : ''}
                  onClick={() => handleMarkRead(rec)}
                  disabled={isRead || isPending}
                >
                  {isPending ? 'در حال ثبت...' : 'خوانده شد'}
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
