import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Alert } from '../../components/ui/Alert';
import { TrendingUp, Book, Award, Target } from 'lucide-react';
import "@/styles/global-styles.css";
import "@/styles/page-styles.css";

export function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
    fetchStats();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/adaptive/progress/');
      setProgress(response.data);
    } catch (err) {
      setError('خطا در دریافت پیشرفت');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/adaptive/dashboard/');
      setStats(response.data);
    } catch (err) {
      console.error('خطا در دریافت آمار:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">پیشرفت تحصیلی</h1>

      {error && (
        <Alert variant="error" onClose={() => setError('')} className="mb-6">
          {error}
        </Alert>
      )}

      {/* آمار کلی */}
      {stats && (
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">سطح شناختی فعلی</p>
                <p className="text-3xl font-bold">{stats.level}</p>
              </div>
              <TrendingUp className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">محتوای تکمیل شده</p>
                <p className="text-3xl font-bold">{stats.completed_count}</p>
              </div>
              <Award className="w-12 h-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">مسیر یادگیری</p>
                <p className="text-xl font-bold">
                  {stats.active_path ? 'فعال' : 'غیرفعال'}
                </p>
              </div>
              <Target className="w-12 h-12 opacity-80" />
            </div>
          </div>
        </div>
      )}

      {/* لیست پیشرفت */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <Book className="w-6 h-6 ml-2" />
          تاریخچه یادگیری
        </h2>

        {progress.length === 0 ? (
          <EmptyState
            icon={Book}
            title="پیشرفتی ثبت نشده"
            description="هنوز محتوایی را مطالعه نکرده‌اید"
          />
        ) : (
          <div className="space-y-4">
            {progress.map(item => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {item.content_title || `محتوای #${item.content}`}
                  </h3>
                  <Badge variant={item.is_completed ? 'success' : 'warning'}>
                    {item.is_completed ? 'تکمیل شده' : 'در حال مطالعه'}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>پیشرفت</span>
                    <span>{Math.round(item.progress_percent)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress_percent}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  آخرین دسترسی: {new Date(item.last_accessed).toLocaleDateString('fa-IR')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgressPage;
