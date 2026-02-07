// src/components/ui/EmptyState.jsx
import { 
  FileX, 
  Search, 
  Inbox, 
  AlertCircle, 
  BookOpen,
  Users,
  ClipboardList,
  TrendingUp,
  Package,
  MessageSquare
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

/**
 * 🎨 Base EmptyState Component
 * 
 * کامپوننت پایه برای نمایش حالت خالی با آیکون، عنوان، توضیحات و اکشن
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  actionLabel,
  className,
  iconClassName,
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className={cn(
        'mb-4 rounded-full bg-gray-100 p-6',
        iconClassName
      )}>
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      
      {title && (
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <Button onClick={action} variant="gradient">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * 📭 Empty Content - محتوایی وجود ندارد
 */
export const EmptyContent = ({ onCreateNew }) => {
  return (
    <EmptyState
      icon={BookOpen}
      title="محتوایی وجود ندارد"
      description="هنوز هیچ محتوایی ایجاد نشده است. برای شروع، اولین محتوای خود را بسازید."
      action={onCreateNew}
      actionLabel="ایجاد محتوای جدید"
      iconClassName="bg-blue-50"
    />
  );
};

/**
 * 🔍 Empty Search - نتیجه‌ای یافت نشد
 */
export const EmptySearch = ({ searchQuery, onClearSearch }) => {
  return (
    <EmptyState
      icon={Search}
      title="نتیجه‌ای یافت نشد"
      description={
        searchQuery 
          ? `هیچ نتیجه‌ای برای "${searchQuery}" پیدا نشد. لطفاً عبارت دیگری جستجو کنید.`
          : 'لطفاً عبارت مورد نظر خود را جستجو کنید.'
      }
      action={onClearSearch}
      actionLabel={searchQuery ? 'پاک کردن جستجو' : undefined}
      iconClassName="bg-purple-50"
    />
  );
};

/**
 * 📝 Empty Tests - آزمونی وجود ندارد
 */
export const EmptyTests = ({ onCreateTest, userRole = 'student' }) => {
  if (userRole === 'teacher') {
    return (
      <EmptyState
        icon={ClipboardList}
        title="آزمونی ایجاد نشده است"
        description="شما هنوز هیچ آزمونی برای دانشجویان ایجاد نکرده‌اید. اولین آزمون خود را بسازید."
        action={onCreateTest}
        actionLabel="ایجاد آزمون جدید"
        iconClassName="bg-green-50"
      />
    );
  }
  
  return (
    <EmptyState
      icon={ClipboardList}
      title="آزمونی در دسترس نیست"
      description="در حال حاضر آزمونی برای شما آماده نشده است. لطفاً بعداً بررسی کنید."
      iconClassName="bg-green-50"
    />
  );
};

/**
 * 📊 Empty Dashboard - داده‌ای وجود ندارد
 */
export const EmptyDashboard = ({ onStartLearning }) => {
  return (
    <EmptyState
      icon={TrendingUp}
      title="داشبورد شما خالی است"
      description="هنوز فعالیتی انجام نداده‌اید. برای شروع یادگیری و مشاهده پیشرفت خود، اولین محتوا را مطالعه کنید."
      action={onStartLearning}
      actionLabel="شروع یادگیری"
      iconClassName="bg-gradient-to-br from-blue-100 to-purple-100"
    />
  );
};

/**
 * 👥 Empty Students - دانشجویی وجود ندارد
 */
export const EmptyStudents = () => {
  return (
    <EmptyState
      icon={Users}
      title="دانشجویی ثبت‌نام نکرده است"
      description="هنوز هیچ دانشجویی در این دوره ثبت‌نام نکرده است."
      iconClassName="bg-orange-50"
    />
  );
};

/**
 * 📦 Empty History - تاریخچه‌ای وجود ندارد
 */
export const EmptyHistory = ({ historyType = 'activity' }) => {
  const titles = {
    activity: 'تاریخچه فعالیت خالی است',
    test: 'تاریخچه آزمون خالی است',
    progress: 'پیشرفتی ثبت نشده است',
  };

  const descriptions = {
    activity: 'شما هنوز هیچ فعالیتی انجام نداده‌اید.',
    test: 'شما هنوز در هیچ آزمونی شرکت نکرده‌اید.',
    progress: 'هنوز پیشرفتی برای نمایش وجود ندارد.',
  };

  return (
    <EmptyState
      icon={Package}
      title={titles[historyType]}
      description={descriptions[historyType]}
      iconClassName="bg-gray-100"
    />
  );
};

/**
 * 💬 Empty Messages - پیامی وجود ندارد
 */
export const EmptyMessages = () => {
  return (
    <EmptyState
      icon={MessageSquare}
      title="پیامی ندارید"
      description="صندوق ورودی شما خالی است. پیام‌های جدید اینجا نمایش داده می‌شوند."
      iconClassName="bg-blue-50"
    />
  );
};

/**
 * ⚠️ Empty Error State - خطا در بارگذاری
 */
export const EmptyError = ({ onRetry, errorMessage }) => {
  return (
    <EmptyState
      icon={AlertCircle}
      title="خطا در بارگذاری اطلاعات"
      description={errorMessage || 'مشکلی در دریافت اطلاعات پیش آمد. لطفاً دوباره تلاش کنید.'}
      action={onRetry}
      actionLabel="تلاش مجدد"
      iconClassName="bg-red-50"
    />
  );
};

/**
 * 🎯 Empty Recommendations - پیشنهادی وجود ندارد
 */
export const EmptyRecommendations = ({ onRefresh }) => {
  return (
    <EmptyState
      icon={TrendingUp}
      title="پیشنهادی برای شما نیست"
      description="در حال حاضر محتوای پیشنهادی برای شما آماده نشده است. با ادامه یادگیری، پیشنهادات شخصی‌سازی شده دریافت خواهید کرد."
      action={onRefresh}
      actionLabel="به‌روزرسانی"
      iconClassName="bg-yellow-50"
    />
  );
};

/**
 * 🎨 Empty State with Custom Content
 */
export const EmptyStateCustom = ({ 
  icon: Icon = FileX, 
  title, 
  children,
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="mb-4 rounded-full bg-gray-100 p-6">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
      
      {title && (
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {title}
        </h3>
      )}
      
      {children}
    </div>
  );
};

// Export تمام variants
export default EmptyState;
