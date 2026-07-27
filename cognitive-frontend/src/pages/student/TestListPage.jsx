import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';

export default function TestListPage() {
  const { fetchAvailableTests, loading } = useAssessment();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [q, setQ] = useState('');
  const [searchAlgo, setSearchAlgo] = useState(user?.preferred_search_algorithm || 'linear');
  const [sortAlgo, setSortAlgo] = useState(user?.preferred_sort_algorithm || 'bubble');
  const [sortBy, setSortBy] = useState(user?.default_sort_field || 'title');
  const [sortOrder, setSortOrder] = useState('asc');

  const load = useCallback(async () => {
    const data = await fetchAvailableTests({
      q,
      search_algo: searchAlgo,
      sort_algo: sortAlgo,
      sort_by: sortBy,
      sort_order: sortOrder,
    });
    setTests(data?.results || []);
    setMeta(data?.catalog_meta || null);
  }, [fetchAvailableTests, q, searchAlgo, sortAlgo, sortBy, sortOrder]);

  useEffect(() => {
    if (!user) return;
    setSearchAlgo(user.preferred_search_algorithm || 'linear');
    setSortAlgo(user.preferred_sort_algorithm || 'bubble');
    setSortBy(user.default_sort_field || 'title');
  }, [user?.id, user?.preferred_search_algorithm, user?.preferred_sort_algorithm, user?.default_sort_field]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="آزمون‌های قابل انجام"
        subtitle="جستجو و مرتب‌سازی با الگوریتم‌های کاتالوگ (Bubble/Merge · Linear/Binary)"
      />

      <Card className="space-y-3">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="text-xs text-neutral-500 mb-1 block">جستجو</label>
            <Input
              placeholder="عنوان یا توضیحات..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">الگوریتم جستجو</label>
            <Select value={searchAlgo} onChange={(e) => setSearchAlgo(e.target.value)}>
              <option value="linear">Linear</option>
              <option value="binary">Binary (تطبیق دقیق فیلد)</option>
            </Select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">الگوریتم مرتب‌سازی</label>
            <Select value={sortAlgo} onChange={(e) => setSortAlgo(e.target.value)}>
              <option value="bubble">Bubble Sort</option>
              <option value="merge">Merge Sort</option>
            </Select>
          </div>
          <div>
            <label className="text-xs text-neutral-500 mb-1 block">فیلد مرتب‌سازی</label>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="title">عنوان</option>
              <option value="min_level">حداقل سطح</option>
              <option value="time_limit_minutes">مدت (دقیقه)</option>
              <option value="created_at">تاریخ ایجاد</option>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            className="w-auto min-w-[120px]"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">صعودی</option>
            <option value="desc">نزولی</option>
          </Select>
          <Button type="button" onClick={load} disabled={loading}>
            {loading ? 'در حال اعمال...' : 'اعمال فیلتر'}
          </Button>
          {meta && (
            <div className="text-xs text-neutral-500">
              {meta.total_before} → {meta.total_after} نتیجه
              {' · '}
              search={meta.search_algorithm}
              {' · '}
              sort={meta.sort_algorithm}/{meta.sort_field}
              {meta.reverse ? ' (desc)' : ''}
            </div>
          )}
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
