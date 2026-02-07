// src/components/ui/Skeleton.jsx
import { cn } from '@/lib/utils';

/**
 * 💀 Base Skeleton Component
 * 
 * کامپوننت پایه برای نمایش skeleton loaders
 * با انیمیشن shimmer effect زیبا
 */
export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    />
  );
};

/**
 * 📊 Skeleton Card - برای کارت‌های محتوا
 */
export const SkeletonCard = ({ showImage = true, lines = 3 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm space-y-4">
      {showImage && (
        <Skeleton className="w-full h-48 rounded-lg" />
      )}
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
};

/**
 * 📝 Skeleton Table Row
 */
export const SkeletonTableRow = ({ columns = 4 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

/**
 * 📋 Skeleton List Item
 */
export const SkeletonListItem = () => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  );
};

/**
 * 📊 Skeleton Stats Card - برای کارت‌های آماری
 */
export const SkeletonStatsCard = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
};

/**
 * 📈 Skeleton Chart - برای نمودارها
 */
export const SkeletonChart = ({ height = 300 }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <Skeleton className="h-6 w-40 mb-4" />
      <Skeleton className={`w-full rounded-lg`} style={{ height: `${height}px` }} />
    </div>
  );
};

/**
 * 🎯 Skeleton Dashboard - کامپوزیت برای داشبورد
 */
export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Skeleton className="h-32 w-full rounded-3xl" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      
      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

/**
 * 📱 Skeleton Content Detail - برای صفحه جزئیات
 */
export const SkeletonContentDetail = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      
      {/* Main Image */}
      <Skeleton className="w-full h-96 rounded-xl" />
      
      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
};

/**
 * 🎬 Skeleton with Shimer Effect (Advanced)
 * نیاز به تعریف animate-shimmer در tailwind.config.js
 */
export const SkeletonShimmer = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

// Export همه کامپوننت‌ها
export default Skeleton;