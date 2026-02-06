import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

/**
 * 📊 داشبورد استاد
 * 
 * ویژگی‌ها:
 * - نمایش آمار کلی (تعداد محتوا، آزمون، دانش‌آموزان)
 * - لیست آخرین فعالیت‌ها
 * - دسترسی سریع به قسمت‌های مختلف
 * - نمایش آزمون‌های نیازمند نمره‌دهی
 */
export default function TeacherDashboard() {
  const { user } = useAuth();
  
  const [stats, setStats] = useState({
    total_contents: 0,
    total_tests: 0,
    total_students: 0,
    pending_grading: 0,
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // فرض می‌کنیم این endpoint ها وجود دارند
      const [statsRes, activityRes] = await Promise.all([
        api.get('/adaptive/teacher/dashboard/stats/'),
        api.get('/adaptive/teacher/dashboard/activity/'),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // در صورت خطا، از داده‌های پیش‌فرض استفاده می‌کنیم
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* هدر خوش‌آمدگویی */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          خوش آمدید، {user?.first_name || 'استاد'} عزیز! 👋
        </h1>
        <p className="text-gray-600">
          آمار و فعالیت‌های آموزشی شما
        </p>
      </div>

      {/* کارت‌های آمار */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">محتوای آموزشی</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total_contents}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">آزمون‌ها</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.total_tests}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">دانش‌آموزان</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.total_students}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">نیاز به نمره‌دهی</p>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.pending_grading}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* دسترسی سریع */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">دسترسی سریع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/teacher/contents/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ساخت محتوا</h3>
                    <p className="text-sm text-gray-600">محتوای آموزشی جدید</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/tests/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">ساخت آزمون</h3>
                    <p className="text-sm text-gray-600">آزمون جدید بسازید</p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/grading">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">نمره‌دهی</h3>
                    <p className="text-sm text-gray-600">
                      {stats.pending_grading} پاسخ در انتظار
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* آخرین فعالیت‌ها */}
      <div>
        <h2 className="text-2xl font-bold mb-4">آخرین فعالیت‌ها</h2>
        <Card>
          <div className="divide-y">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                هنوز فعالیتی ثبت نشده است
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
