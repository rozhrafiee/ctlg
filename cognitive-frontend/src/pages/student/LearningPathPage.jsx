import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function LearningPathPage() {
  const { fetchLearningPath, resetLearningPath, fetchLearningRoadmap } = useAdaptive();
  const [path, setPath] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [pathError, setPathError] = useState(null);
  const [roadmapError, setRoadmapError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setPathError(null);
    try {
      const data = await fetchLearningPath();
      setPath(data);
    } catch {
      setPathError('بارگذاری مسیر یادگیری ناموفق بود.');
      setPath(null);
    }
  };

  const loadRoadmap = async () => {
    setRoadmapError(null);
    try {
      const data = await fetchLearningRoadmap(30);
      setRoadmap(data);
    } catch {
      setRoadmapError('بارگذاری نقشه راه ناموفق بود.');
      setRoadmap(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await Promise.all([load(), loadRoadmap()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReset = async () => {
    setResetting(true);
    setPathError(null);
    try {
      const data = await resetLearningPath();
      setPath(data);
      await loadRoadmap();
    } catch {
      setPathError('بازنشانی مسیر ناموفق بود.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={path?.name || 'مسیر یادگیری'}
        subtitle="مسیر فعال شما — محتوا را باز کنید و تکمیل کنید"
        actions={(
          <Button type="button" variant="secondary" disabled={resetting} onClick={handleReset}>
            {resetting ? 'در حال بازنشانی...' : 'بازنشانی مسیر'}
          </Button>
        )}
      />

      {pathError && (
        <Card className="text-sm text-red-700 bg-red-50 border border-red-100">{pathError}</Card>
      )}

      {loading && !path && <Card>در حال بارگذاری مسیر...</Card>}

      {path?.items?.map((item) => {
        const unlocked = item.is_unlocked;
        const contentId = item.content?.id;
        return (
          <Card key={item.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold">{item.content?.title}</div>
              <div className="text-xs text-slate-500">
                سطح مورد نیاز: {item.content?.min_level ?? '-'}
                {item.content?.max_level != null ? ` تا ${item.content.max_level}` : ''}
                {' · '}
                {unlocked ? 'باز' : 'قفل'}
              </div>
            </div>
            {unlocked && contentId ? (
              <Link to={`/student/content/${contentId}`}>
                <Button type="button">مشاهده محتوا</Button>
              </Link>
            ) : (
              <Button type="button" variant="secondary" disabled>
                قفل
              </Button>
            )}
          </Card>
        );
      })}
      {!loading && path && !path?.items?.length && (
        <Card>
          آیتمی در مسیر وجود ندارد. اگر محتوایی باقی مانده، «بازنشانی مسیر» را بزنید؛ در غیر این صورت همه محتواهای فعلی را تکمیل کرده‌اید.
        </Card>
      )}

      <Card className="border-primary/10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="section-title text-neutral-800 mb-0">نقشه راه تا سطح‌های بعد</h3>
          <Button type="button" variant="secondary" onClick={loadRoadmap}>به‌روزرسانی</Button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          این تایم‌لاین بر اساس سطح فعلی شما و محتواهای ناتمام ساخته می‌شود.
        </p>

        {roadmapError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-4">
            {roadmapError}
          </div>
        )}

        {roadmap?.steps?.length ? (
          <div className="space-y-3">
            {roadmap.steps.map((s, idx) => {
              const locked = !s.is_available;
              const done = s.is_completed;
              const test = s.related_test;
              return (
                <div key={`roadmap-${s.id}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${done ? 'bg-emerald-500' : locked ? 'bg-neutral-300' : 'bg-primary'}`} />
                    {idx < roadmap.steps.length - 1 && <div className="w-px flex-1 bg-neutral-200 mt-2" />}
                  </div>

                  <div className={`flex-1 rounded-xl border px-4 py-3 ${locked ? 'bg-neutral-50 border-neutral-200' : 'bg-white border-neutral-200/80'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-neutral-900 truncate">{s.title}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          سطح پیشنهادی: {s.min_level} تا {s.max_level} · نوع: {s.content_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {done ? (
                          <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg">انجام شد</span>
                        ) : locked ? (
                          <span className="text-xs font-medium text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg">قفل (سطح پایین‌تر)</span>
                        ) : (
                          <span className="text-xs font-medium text-primary bg-primary-soft/40 px-2 py-1 rounded-lg">آماده انجام</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 items-center">
                      {locked ? (
                        <Button type="button" variant="secondary" disabled>مشاهده محتوا</Button>
                      ) : (
                        <Link to={`/student/content/${s.id}`}>
                          <Button type="button" variant="secondary">مشاهده محتوا</Button>
                        </Link>
                      )}
                      {test?.id && (
                        locked || !test.is_available ? (
                          <Button type="button" disabled>شروع آزمون مرتبط</Button>
                        ) : (
                          <Link to={`/student/tests/${test.id}/take`}>
                            <Button type="button">شروع آزمون مرتبط</Button>
                          </Link>
                        )
                      )}
                      {!done && !locked && (
                        <div className="text-xs text-neutral-500">
                          پیشرفت فعلی: {Math.round(s.progress_percent)}%
                        </div>
                      )}
                    </div>

                    {test?.id && (
                      <div className="mt-2 text-xs text-neutral-500">
                        آزمون: {test.title} · حداقل سطح: {test.min_level} · سطح هدف: {test.target_level}
                        {test.is_completed ? ' · (انجام شده)' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">
            {loading ? 'در حال بارگذاری نقشه راه...' : 'فعلاً آیتمی برای نقشه راه پیدا نشد.'}
          </div>
        )}
      </Card>
    </div>
  );
}
