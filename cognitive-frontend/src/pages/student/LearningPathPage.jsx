import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';

export default function LearningPathPage() {
  const { fetchLearningPath, resetLearningPath } = useAdaptive();
  const [path, setPath] = useState(null);

  const load = async () => {
    const data = await fetchLearningPath();
    setPath(data);
  };

  useEffect(() => {
    load();
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
            <div className="text-xs text-slate-500">ترتیب: {item.order}</div>
          </div>
          <div className="text-xs text-slate-500">
            {item.is_unlocked ? 'باز' : 'قفل'}
          </div>
        </Card>
      ))}
      {!path?.items?.length && <Card>آیتمی در مسیر وجود ندارد.</Card>}
    </div>
  );
}
