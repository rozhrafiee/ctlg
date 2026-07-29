import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import PageHeader from '../../components/ui/PageHeader';

export default function TestListPage() {
  const { fetchAvailableTests, loading } = useAssessment();
  const [tests, setTests] = useState([]);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const data = await fetchAvailableTests({ q });
    setTests(data?.results || []);
  }, [fetchAvailableTests, q]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="آزمون‌های قابل انجام"
        subtitle="جستجو در آزمون‌های در دسترس"
      />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-neutral-500 mb-1 block">جستجو</label>
            <Input
              placeholder="عنوان یا توضیحات..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <Button type="button" onClick={load} disabled={loading}>
            {loading ? 'در حال اعمال...' : 'اعمال فیلتر'}
          </Button>
        </div>
      </Card>

      {tests.map((test) => (
        <Card key={test.id} className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{test.title}</h3>
              <Badge tone="teal">{test.test_type}</Badge>
            </div>
            <div className="text-xs text-slate-500">{test.description}</div>
            <div className="text-xs text-neutral-400 mt-1">
              سطح حداقل: {test.min_level} · مدت: {test.time_limit_minutes} دقیقه
            </div>
          </div>
          <Link to={`/student/tests/${test.id}/take`}>
            <Button>شروع آزمون</Button>
          </Link>
        </Card>
      ))}
      {!tests.length && <Card>آزمونی با این فیلتر پیدا نشد.</Card>}
    </div>
  );
}
