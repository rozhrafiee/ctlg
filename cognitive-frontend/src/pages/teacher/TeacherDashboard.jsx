import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';

export default function TeacherDashboard() {
  const { fetchTeacherDashboard, fetchStudentReport } = useAnalytics();
  const { logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchTeacherDashboard();
      setDashboard(data);
    };
    load();
  }, []);

  const loadReport = async () => {
    if (!studentId) return;
    const data = await fetchStudentReport(studentId);
    setReport(data);
  };

  return (
    <div className="space-y-6">
      <div className="surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">پنل تخصصی اساتید</h2>
            <p className="text-sm text-slate-500">خوش آمدید، {dashboard?.teacher_name || 'استاد'}</p>
          </div>
          <Button variant="secondary" onClick={logout}>خروج از سامانه</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface p-5 border-l-4 border-emerald-400">
          <div className="text-3xl font-extrabold text-slate-900">{dashboard?.stats?.total_contents ?? 0}</div>
          <div className="text-xs text-slate-500">محتواهای فعال</div>
        </div>
        <div className="surface p-5 border-l-4 border-amber-400">
          <div className="text-3xl font-extrabold text-slate-900">{dashboard?.stats?.pending_grading ?? 0}</div>
          <div className="text-xs text-slate-500">نیاز به تصحیح (تشریحی)</div>
        </div>
        <div className="surface p-5 border-l-4 border-blue-400">
          <div className="text-3xl font-extrabold text-slate-900">{dashboard?.stats?.total_tests ?? 0}</div>
          <div className="text-xs text-slate-500">آزمون‌های طراحی شده</div>
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="section-title mb-4 text-center">دسترسی سریع</h3>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <Link to="/teacher/contents" className="rounded-xl bg-slate-50 p-3 text-center">بارگذاری محتوای آموزشی</Link>
          <Link to="/teacher/tests" className="rounded-xl bg-slate-50 p-3 text-center">مدیریت کل آزمون‌ها</Link>
          <Link to="/teacher/grading" className="rounded-xl bg-slate-50 p-3 text-center">تصحیح پاسخ‌های تشریحی</Link>
          <Link to="/teacher/tests/create" className="rounded-xl bg-emerald-500 p-3 text-center text-white">ساخت آزمون جدید</Link>
        </div>
      </div>

      <div className="surface p-6">
        <h3 className="section-title mb-3">گزارش دانش‌آموز</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="شناسه دانش‌آموز"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <Button onClick={loadReport}>نمایش گزارش</Button>
          <Button variant="secondary" disabled>گزارش همه</Button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          فعلا فقط گزارش یک دانش‌آموز با شناسه قابل دریافت است (بک‌اند گزارش همه را ندارد).
        </p>
        {report && (
          <pre className="mt-4 text-xs bg-slate-50 p-4 rounded-xl overflow-auto">{JSON.stringify(report, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
