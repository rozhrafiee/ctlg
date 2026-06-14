import Button from '../ui/Button';
import Select from '../ui/Select';

const SORT_FIELDS = [
  { value: 'title', label: 'عنوان آزمون' },
  { value: 'min_level', label: 'حداقل سطح' },
  { value: 'time_limit_minutes', label: 'مدت زمان' },
  { value: 'created_at', label: 'جدیدترین' },
];

export { SORT_FIELDS };

export default function TestCatalogFilters({
  query,
  onQueryChange,
  sortField,
  onSortFieldChange,
  reverse,
  onReverseChange,
  onApply,
  loading,
  resultCount,
  totalCount,
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-sm md:col-span-2">
          <span className="text-slate-600">جستجو در آزمون‌ها</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="نام یا موضوع آزمون..."
            onKeyDown={(e) => e.key === 'Enter' && onApply()}
          />
        </label>
        <label className="block text-sm">
          <span className="text-slate-600">مرتب‌سازی</span>
          <Select className="mt-1" value={sortField} onChange={(e) => onSortFieldChange(e.target.value)}>
            {SORT_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => onReverseChange(e.target.checked)}
            className="rounded border-slate-300"
          />
          از زیاد به کم
        </label>
        <Button onClick={onApply} disabled={loading}>
          {loading ? 'در حال بارگذاری...' : 'اعمال'}
        </Button>
        {totalCount != null && (
          <span className="text-xs text-slate-500 mr-auto">
            {resultCount} از {totalCount} آزمون
          </span>
        )}
      </div>
    </div>
  );
}
