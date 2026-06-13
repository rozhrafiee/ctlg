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
  const [roadmapError, setRoadmapError] = useState(null);

  const load = async () => {
    const data = await fetchLearningPath();
    setPath(data);
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
    load();
    loadRoadmap();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title={path?.name || 'مسیر یادگیری'}
        subtitle="مسیر فعال شما"
        actions={(
          <Button variant="secondary" onClick={async () => { await resetLearningPath(); load(); }}>
            بازنشانی مسیر
          </Button>
        )}
      />
      {path?.items?.map((item) => (
        <Card key={item.id} className="flex items-center justify-between">
          <div>
            <div className="font-semibold">{item.content?.title}</div>
            <div className="text-xs text-slate-500">سطح مورد نیاز برای باز شدن قفل: {item.content?.min_level ?? '-'}</div>
          </div>
          <div className="text-xs text-slate-500">
            {item.is_unlocked ? 'باز' : 'قفل'}
          </div>
        </Card>
      ))}
      {!path?.items?.length && <Card>آیتمی در مسیر وجود ندارد.</Card>}

      <Card className="border-primary/10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="section-title text-neutral-800 mb-0">نقشه راه تا سطح‌های بعد</h3>
          <Button variant="secondary" onClick={loadRoadmap}>به‌روزرسانی</Button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">
          این تایم‌لاین بر اساس سطح فعلی شما ساخته می‌شود و هر بار محتوای جدید یا آزمون جدید برای سطح‌های بالاتر اضافه شود، به ادامه مسیر اضافه خواهد شد.
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
                      <Link to={`/student/content/${s.id}`}>
                        <Button variant="secondary" disabled={locked}>مشاهده محتوا</Button>
                      </Link>
                      {test?.id && (
                        <Link to={`/student/tests/${test.id}/take`}>
                          <Button disabled={locked || !test.is_available}>
                            شروع آزمون مرتبط
                          </Button>
                        </Link>
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
          <div className="text-sm text-neutral-500">فعلاً آیتمی برای نقشه راه پیدا نشد.</div>
        )}
      </Card>
    </div>
  );
}
