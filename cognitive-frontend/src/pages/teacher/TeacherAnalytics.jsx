import React from 'react';
import { useFetch } from '@/hooks/useApi';
import { 
  CustomLineChart, 
  CustomBarChart, 
  ChartCard,
  CHART_COLORS 
} from '@/components/ui/Chart';
import { Badge } from '@/components/ui/Badge';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';

export default function TeacherAnalytics() {
  const { data: analytics, isLoading, error } = useFetch('/api/teacher/analytics/');

  // داده‌های Mock
  const studentProgressData = [
    { week: 'هفته 1', completed: 12, in_progress: 8 },
    { week: 'هفته 2', completed: 18, in_progress: 6 },
    { week: 'هفته 3', completed: 25, in_progress: 9 },
    { week: 'هفته 4', completed: 32, in_progress: 5 },
  ];

  const contentEngagementData = [
    { content: 'محتوای A', views: 145 },
    { content: 'محتوای B', views: 132 },
    { content: 'محتوای C', views: 98 },
    { content: 'محتوای D', views: 76 },
  ];

  if (isLoading) return <SkeletonDashboard />;
  if (error) return <EmptyState variant="error" />;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display">تحلیل‌های آموزشی</h1>
        <p className="text-muted-foreground mt-1">
          آمار و عملکرد دانش‌آموزان در محتوای شما
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="کل دانش‌آموزان"
          value={analytics?.total_students || 0}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-500"
        />
        <StatCard
          title="محتوای منتشر شده"
          value={analytics?.published_content || 0}
          icon={<BookOpen className="w-5 h-5" />}
          color="text-green-500"
        />
        <StatCard
          title="میانگین تکمیل"
          value={`${analytics?.avg_completion || 0}%`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-orange-500"
        />
        <StatCard
          title="نرخ موفقیت"
          value={`${analytics?.success_rate || 0}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="پیشرفت دانش‌آموزان"
          subtitle="تعداد محتوای تکمیل شده در طول زمان"
        >
          <CustomLineChart
            data={studentProgressData}
            xKey="week"
            lines={[
              { dataKey: 'completed', name: 'تکمیل شده', color: CHART_COLORS.secondary },
              { dataKey: 'in_progress', name: 'در حال انجام', color: CHART_COLORS.tertiary },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="محبوب‌ترین محتوا"
          subtitle="بر اساس تعداد بازدید"
        >
          <CustomBarChart
            data={contentEngagementData}
            xKey="content"
            bars={[
              { dataKey: 'views', name: 'بازدید', color: CHART_COLORS.primary },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`${color}`}>{icon}</div>
      </div>
    </div>
  );
}
