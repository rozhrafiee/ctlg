import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

import "@/styles/global-styles.css";
import "@/styles/page-styles.css";
import "@/styles/teacher-dashboard.css";

/**
 * 📊 داشبورد استاد
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
      const res = await api.get('/analytics/teacher-dashboard/');
      const { stats: serverStats, recent_pending_reviews = [] } = res.data;

      setStats({
        total_contents: serverStats?.total_contents ?? 0,
        total_tests: serverStats?.total_tests ?? 0,
        total_students: serverStats?.total_students ?? 0,
        pending_grading: serverStats?.pending_grading ?? 0,
      });

      setRecentActivity(
        recent_pending_reviews.map((r) => ({
          description: `آزمون ${r.test_title || ''} - در انتظار نمره‌دهی`,
          timestamp: r.started_at
            ? new Date(r.started_at).toLocaleDateString('fa-IR')
            : '',
        }))
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="teacher-loading">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 teacher-dashboard">

      {/* ───── Header ───── */}
      <div className="teacher-header">
        <h1>
          خوش آمدید، {user?.first_name || 'استاد'} عزیز! 👋
        </h1>
        <p>آمار و فعالیت‌های آموزشی شما</p>
      </div>

      {/* ───── Stats ───── */}
      <div className="teacher-stats-grid">

        <Card className="teacher-stat-card">
          <p className="teacher-stat-title">محتوای آموزشی</p>
          <p className="teacher-stat-value text-blue-400">
            {stats.total_contents}
          </p>
        </Card>

        <Card className="teacher-stat-card">
          <p className="teacher-stat-title">آزمون‌ها</p>
          <p className="teacher-stat-value text-green-400">
            {stats.total_tests}
          </p>
        </Card>

        <Card className="teacher-stat-card">
          <p className="teacher-stat-title">دانش‌آموزان</p>
          <p className="teacher-stat-value text-purple-400">
            {stats.total_students}
          </p>
        </Card>

        <Card className="teacher-stat-card">
          <p className="teacher-stat-title">در انتظار نمره‌دهی</p>
          <p className="teacher-stat-value text-orange-400">
            {stats.pending_grading}
          </p>
        </Card>

      </div>

      {/* ───── Quick Access ───── */}
      <div className="teacher-quick-access">
        <h2 className="text-2xl font-bold mb-4">دسترسی سریع</h2>

        <div className="teacher-quick-grid">

          <Link to="/teacher/contents/create">
            <Card className="teacher-quick-card">
              <div className="flex items-center gap-4">
                <div className="teacher-quick-icon bg-blue-500/20 text-blue-400">
                  +
                </div>
                <div>
                  <h3 className="font-semibold">ساخت محتوا</h3>
                  <p className="text-sm text-gray-400">محتوای آموزشی جدید</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/tests/create">
            <Card className="teacher-quick-card">
              <div className="flex items-center gap-4">
                <div className="teacher-quick-icon bg-green-500/20 text-green-400">
                  +
                </div>
                <div>
                  <h3 className="font-semibold">ساخت آزمون</h3>
                  <p className="text-sm text-gray-400">آزمون جدید بسازید</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/teacher/grading">
            <Card className="teacher-quick-card">
              <div className="flex items-center gap-4">
                <div className="teacher-quick-icon bg-orange-500/20 text-orange-400">
                  !
                </div>
                <div>
                  <h3 className="font-semibold">نمره‌دهی</h3>
                  <p className="text-sm text-gray-400">
                    {stats.pending_grading} پاسخ در انتظار
                  </p>
                </div>
              </div>
            </Card>
          </Link>

        </div>
      </div>

      {/* ───── Recent Activity ───── */}
      <div className="teacher-activity">
        <h2 className="text-2xl font-bold mb-4">آخرین فعالیت‌ها</h2>

        <Card>
          {recentActivity.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              هنوز فعالیتی ثبت نشده است
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div key={index} className="teacher-activity-item p-4">
                <div className="flex items-center gap-4">
                  <div className="teacher-activity-dot" />
                  <div className="flex-1">
                    <p className="teacher-activity-text">
                      {activity.description}
                    </p>
                    <p className="teacher-activity-date">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

    </div>
  );
}
