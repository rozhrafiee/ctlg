import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

/** Illustrative complexity ops for n≈1000 (Silver Project catalog algorithms). */
const SORT_COMPLEXITY = [
  { name: 'Bubble Sort', ops: 500000, label: 'O(n²)' },
  { name: 'Merge Sort', ops: 10000, label: 'O(n log n)' },
];

const SEARCH_COMPLEXITY = [
  { name: 'Linear Search', ops: 1000, label: 'O(n)' },
  { name: 'Binary Search', ops: 10, label: 'O(log n)' },
];

/** Sample mutation kill rates from typical Silver Project runs. */
const MUTATION_KILL = [
  { name: 'sorting.py', rate: 92 },
  { name: 'searching.py', rate: 88 },
  { name: 'catalog.py', rate: 85 },
];

const CHART_COLORS = ['#1e4d6b', '#0d7377', '#c4a747'];

function ChartTooltip({ active, payload, unit = '' }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="font-medium text-neutral-800">{p.name}</div>
      {p.label && <div className="text-xs text-neutral-500 mt-0.5">{p.label}</div>}
      <div className="text-primary font-semibold mt-0.5">
        {payload[0].value}
        {unit}
      </div>
    </div>
  );
}

export default function TestGraphsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="گراف پوشش و Mutation"
        subtitle="نمای آموزشی الگوریتم‌های کاتالوگ آزمون در Silver Project"
      />

      <div className="surface p-6 border-primary/10">
        <h3 className="section-title mb-3 text-neutral-800">کاتالوگ الگوریتم‌ها</h3>
        <p className="text-sm text-neutral-600 leading-7">
          در پروژهٔ نقره‌ای (<code className="text-xs bg-primary-soft px-1.5 py-0.5 rounded">silver_project</code>)
          فهرست آزمون‌ها با الگوریتم‌های دستی مرتب‌سازی و جست‌وجو پردازش می‌شود:
          <strong className="font-semibold text-neutral-800"> Bubble Sort</strong> و{' '}
          <strong className="font-semibold text-neutral-800">Merge Sort</strong> برای مرتب‌سازی،
          و <strong className="font-semibold text-neutral-800">Linear Search</strong> و{' '}
          <strong className="font-semibold text-neutral-800">Binary Search</strong> برای فیلتر بر اساس پرس‌وجو.
          پارامترهای API مانند <code className="text-xs bg-primary-soft px-1.5 py-0.5 rounded">sort_algo</code> و{' '}
          <code className="text-xs bg-primary-soft px-1.5 py-0.5 rounded">search_algo</code> همین انتخاب‌ها را کنترل می‌کنند.
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          واحدتست‌های الگوریتم (پوشش ACOC / CFG و Mutation Testing) در مسیر{' '}
          <code className="bg-neutral-100 px-1.5 py-0.5 rounded">silver_project/</code> قرار دارند — این صفحه فقط تجسم آموزشی مفاهیم است.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-primary/10 overflow-hidden">
          <h3 className="section-title text-neutral-800 mb-2">مقایسه پیچیدگی مرتب‌سازی</h3>
          <p className="text-xs text-neutral-500 mb-4">
            تعداد تقریبی عملیات برای n≈۱۰۰۰ — Bubble در بدترین حالت O(n²)، Merge تقریباً O(n log n).
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SORT_COMPLEXITY} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip unit=" ops" />} />
              <Bar dataKey="ops" radius={[8, 8, 0, 0]}>
                {SORT_COMPLEXITY.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="border-primary/10 overflow-hidden">
          <h3 className="section-title text-neutral-800 mb-2">مقایسه پیچیدگی جست‌وجو</h3>
          <p className="text-xs text-neutral-500 mb-4">
            Linear تا n مقایسه می‌کند؛ Binary روی لیست مرتب‌شده فقط حدود log₂(n) مقایسه نیاز دارد.
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={SEARCH_COMPLEXITY} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip unit=" ops" />} />
              <Bar dataKey="ops" radius={[8, 8, 0, 0]}>
                {SEARCH_COMPLEXITY.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="border-primary/10 overflow-hidden">
        <h3 className="section-title text-neutral-800 mb-2">نرخ کشتن جهش‌ها (نمونه)</h3>
        <p className="text-xs text-neutral-500 mb-4">
          Mutation testing کیفیت مجموعهٔ تست را با معرفی باگ‌های مصنوعی می‌سنجد.
          اعداد زیر نمونهٔ آموزشی از نتایج معمول روی ماژول‌های الگوریتم هستند.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={MUTATION_KILL} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
            <Tooltip content={<ChartTooltip unit="%" />} />
            <Legend />
            <Bar dataKey="rate" name="Mutation kill rate %" radius={[8, 8, 0, 0]} fill="#0d7377" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
