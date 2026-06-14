import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../../hooks/useAssessment';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import TestCatalogFilters, { SORT_FIELDS } from '../../components/assessment/CatalogAlgorithmPanel';

export default function TestListPage() {
  const { fetchCatalogTests, loading } = useAssessment();
  const [tests, setTests] = useState([]);
  const [meta, setMeta] = useState(null);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState('title');
  const [reverse, setReverse] = useState(false);

  const loadCatalog = useCallback(async () => {
    const data = await fetchCatalogTests({
      q: query,
      sort_field: sortField,
      reverse: reverse ? 'true' : 'false',
    });
    setTests(data?.results || []);
    setMeta(data?.catalog_meta || null);
  }, [fetchCatalogTests, query, sortField, reverse]);

  useEffect(() => {
    loadCatalog().catch(() => {});
  }, [sortField, reverse]);

  const sortLabel = SORT_FIELDS.find((f) => f.value === sortField)?.label || 'عنوان';

  return (
    <div className="space-y-4">
      <PageHeader
        title="آزمون‌های قابل انجام"
        subtitle="جستجو و مرتب‌سازی بر اساس نیاز شما"
      />

      <Card title="فیلتر و مرتب‌سازی">
        <TestCatalogFilters
          query={query}
          onQueryChange={setQuery}
          sortField={sortField}
          onSortFieldChange={setSortField}
          reverse={reverse}
          onReverseChange={setReverse}
          onApply={loadCatalog}
          loading={loading}
          resultCount={meta?.total_after ?? tests.length}
          totalCount={meta?.total_before}
        />
      </Card>

      <div className="text-sm text-slate-500 px-1">
        {tests.length} آزمون · مرتب بر اساس {sortLabel}
        {reverse ? ' (نزولی)' : ''}
      </div>

      {tests.map((test, index) => (
        <Card key={test.id} className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-sm font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold truncate">{test.title}</h3>
                <Badge tone="teal">{test.test_type}</Badge>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                سطح {test.min_level} · {test.time_limit_minutes} دقیقه
              </div>
              {test.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{test.description}</p>
              )}
            </div>
          </div>
          <Link to={`/student/tests/${test.id}/take`} className="flex-shrink-0">
            <Button>شروع آزمون</Button>
          </Link>
        </Card>
      ))}

      {!tests.length && !loading && (
        <Card>
          <p className="text-slate-600">آزمونی با این جستجو پیدا نشد.</p>
        </Card>
      )}
    </div>
  );
}
