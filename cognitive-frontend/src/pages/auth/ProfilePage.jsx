import { useEffect, useState } from 'react';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeader from '../../components/ui/PageHeader';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { fetchMyStats } = useAnalytics();
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    preferred_sort_algorithm: user?.preferred_sort_algorithm || 'bubble',
    preferred_search_algorithm: user?.preferred_search_algorithm || 'linear',
    default_sort_field: user?.default_sort_field || 'title',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.role !== 'student') return;
    fetchMyStats()
      .then(setStats)
      .catch(() => setStats(null));
  }, [user?.role, user?.id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    await api.patch('/accounts/profile/', form);
    await refreshProfile();
    setMessage('پروفایل به‌روز شد.');
  };

  return (
    <div className="space-y-4">
      <PageHeader title="پروفایل" subtitle="مدیریت اطلاعات حساب و ترجیحات کاتالوگ آزمون" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 form-card border-primary/10">
          <h3 className="section-title text-neutral-800 mb-5">اطلاعات کاربری</h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">نام</label>
              <Input
                placeholder="نام"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">نام خانوادگی</label>
              <Input
                placeholder="نام خانوادگی"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">ایمیل</label>
              <Input
                placeholder="example@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 border-t border-neutral-100 pt-4">
              <h4 className="font-semibold text-neutral-800 mb-3">ترجیحات الگوریتم کاتالوگ آزمون</h4>
              <p className="text-xs text-neutral-500 mb-3">
                این مقادیر پیش‌فرض برای صفحه «آزمون‌ها» استفاده می‌شوند (قابل تغییر در همان صفحه).
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">مرتب‌سازی پیش‌فرض</label>
              <Select
                value={form.preferred_sort_algorithm}
                onChange={(e) => setForm({ ...form, preferred_sort_algorithm: e.target.value })}
              >
                <option value="bubble">Bubble Sort</option>
                <option value="merge">Merge Sort</option>
              </Select>
            </div>
            <div className="form-group">
              <label className="form-label">جستجوی پیش‌فرض</label>
              <Select
                value={form.preferred_search_algorithm}
                onChange={(e) => setForm({ ...form, preferred_search_algorithm: e.target.value })}
              >
                <option value="linear">Linear Search</option>
                <option value="binary">Binary Search</option>
              </Select>
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">فیلد مرتب‌سازی پیش‌فرض</label>
              <Select
                value={form.default_sort_field}
                onChange={(e) => setForm({ ...form, default_sort_field: e.target.value })}
              >
                <option value="title">عنوان</option>
                <option value="min_level">حداقل سطح</option>
                <option value="time_limit_minutes">مدت آزمون</option>
                <option value="created_at">تاریخ ایجاد</option>
              </Select>
            </div>

            <div className="md:col-span-2 form-actions pt-4 flex items-center gap-3">
              <Button type="submit">ذخیره</Button>
              {message && <span className="text-sm text-secondary font-medium">{message}</span>}
            </div>
          </form>
        </Card>
        <Card>
          <h3 className="section-title mb-3">وضعیت شناختی</h3>
          <div className="space-y-2 text-sm text-neutral-600">
            {user?.role !== 'teacher' && user?.role !== 'admin' && (
              <>
                <div>
                  سطح:{' '}
                  <span className="font-semibold text-neutral-900">{user?.cognitive_level ?? '-'}</span>
                </div>
                <div>
                  آزمون تعیین سطح:{' '}
                  <span className="font-semibold text-neutral-900">
                    {user?.has_taken_placement_test ? 'انجام شده' : 'انجام نشده'}
                  </span>
                </div>
                {stats && (
                  <>
                    <div>
                      حافظه:{' '}
                      <span className="font-semibold text-neutral-900">
                        {Number(stats.avg_memory_score ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      تمرکز:{' '}
                      <span className="font-semibold text-neutral-900">
                        {Number(stats.avg_focus_score ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      منطق:{' '}
                      <span className="font-semibold text-neutral-900">
                        {Number(stats.avg_logic_score ?? 0).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      آزمون‌های تکمیل‌شده:{' '}
                      <span className="font-semibold text-neutral-900">
                        {stats.total_tests_completed ?? 0}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
            <div>
              نقش:{' '}
              <span className="font-semibold text-neutral-900">
                {user?.role === 'student'
                  ? 'Citizen'
                  : user?.role === 'teacher'
                    ? 'مسئول شهری (مدرس)'
                    : user?.role === 'admin'
                      ? 'Manager'
                      : user?.role}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
