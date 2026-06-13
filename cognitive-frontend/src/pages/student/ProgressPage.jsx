import { useEffect, useState } from 'react';
import { useAdaptive } from '../../hooks/useAdaptive';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric', year: '2-digit' });
}

export default function ProgressPage() {
  const { fetchProgress } = useAdaptive();
  const { fetchStudentDashboard } = useAnalytics();
  const [items, setItems] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [progressRes, dashboardRes] = await Promise.all([
        fetchProgress().catch(() => []),
        fetchStudentDashboard().catch(() => null),
      ]);
      setItems(progressRes || []);
      setChartData(dashboardRes?.chart_data || null);
    };
    load();
  }, []);

  const BAR_COLORS = ['#1e4d6b', '#0d7377'];
  const barData = chartData
    ? [
        { name: 'محتواهای خوانده‌شده', count: chartData.content_completed_count || 0 },
        { name: 'آزمون‌های داده‌شده', count: chartData.tests_completed_count || 0 },
      ]
    : [];

  const levelHistory = chartData?.level_history || [];
  const lineData = [...levelHistory].reverse().map((h, i) => ({
    index: i + 1,
    level: h.new_level,
    date: formatDate(h.timestamp),
    full: `${h.old_level} → ${h.new_level}`,
  }));

  const CustomBarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <div className="font-medium text-neutral-800">{p.name}</div>
        <div className="text-primary font-semibold mt-0.5">تعداد: {p.count}</div>
      </div>
    );
  };
  const CustomLineTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        <div className="text-neutral-600">{p.date}</div>
        <div className="font-medium text-primary mt-0.5">سطح: {p.level} ({p.full})</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="پیشرفت من" subtitle="وضعیت تکمیل محتواها و آزمون‌ها" />

      {chartData && (
        <Card className="border-primary/10 overflow-hidden">
          <h3 className="section-title text-neutral-800 mb-5">نمودار پیشرفت</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="min-w-0" dir="rtl">
              <p className="text-sm font-medium text-neutral-700 mb-3">مقایسه محتوا و آزمون</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 8, right: 40, left: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: '#1e4d6b', fontWeight: 500 }}
                    tickLine={{ stroke: '#1e4d6b', strokeWidth: 1 }}
                    axisLine={{ stroke: '#1e4d6b', strokeWidth: 1.5 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={165}
                    tick={{ fontSize: 13, fill: '#1e4d6b', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#1e4d6b', strokeWidth: 1.5 }}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(30, 77, 107, 0.06)' }} />
                  <Bar dataKey="count" name="تعداد" radius={[0, 6, 6, 0]} maxBarSize={48}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="min-w-0" dir="rtl">
              <p className="text-sm font-medium text-neutral-700 mb-3">سطح در طول زمان</p>
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={lineData}
                    margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#1e4d6b', fontWeight: 500 }}
                      tickLine={{ stroke: '#1e4d6b', strokeWidth: 1 }}
                      axisLine={{ stroke: '#1e4d6b', strokeWidth: 1.5 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#1e4d6b', fontWeight: 500 }}
                      tickLine={{ stroke: '#1e4d6b', strokeWidth: 1 }}
                      axisLine={{ stroke: '#1e4d6b', strokeWidth: 1.5 }}
                      ticks={[0, 25, 50, 75, 100]}
                      width={28}
                    />
                    <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#1e4d6b', strokeDasharray: '4 4' }} />
                    <Legend wrapperStyle={{ paddingTop: 8 }} iconType="circle" iconSize={8} align="center" />
                    <Line
                      type="monotone"
                      dataKey="level"
                      name="سطح"
                      stroke="#1e4d6b"
                      strokeWidth={2.5}
                      dot={{ fill: '#1e4d6b', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#1e4d6b', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-neutral-500 text-sm border border-neutral-200 rounded-xl bg-neutral-50/50">
                  هنوز تاریخچه سطح ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card className="border-primary/10">
        <h3 className="section-title text-neutral-800 mb-3">وضعیت محتواها</h3>
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-primary-soft/20 px-4 py-3"
              >
                <div>
                  <div className="font-semibold text-neutral-900">{item.content_title}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">آخرین دسترسی: {item.last_accessed}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold text-primary">{Math.round(item.progress_percent)}%</div>
                  {item.is_completed && (
                    <span className="text-xs font-medium text-secondary bg-secondary-soft px-2 py-1 rounded-lg">
                      تکمیل شده
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">پیشرفتی ثبت نشده است.</p>
        )}
      </Card>
    </div>
  );
}
