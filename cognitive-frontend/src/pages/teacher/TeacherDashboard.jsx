import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function TeacherDashboard() {
  const { fetchTeacherDashboard, fetchStudentReport } = useAnalytics();
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
      <div className="surface p-6 border-primary/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">پنل تخصصی مسئولان شهری (مدرسان)</h2>
          <p className="text-sm text-neutral-500 mt-1">خوش آمدید، {dashboard?.teacher_name || 'مسئول شهری (مدرس)'}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="surface p-5 border-r-4 border-primary stat-card">
          <div className="text-3xl font-extrabold text-primary">{dashboard?.stats?.total_contents ?? 0}</div>
          <div className="text-xs text-neutral-500 mt-1">محتواهای فعال</div>
        </div>
        <div className="surface p-5 border-r-4 border-secondary stat-card">
          <div className="text-3xl font-extrabold text-secondary">{dashboard?.stats?.pending_grading ?? 0}</div>
          <div className="text-xs text-neutral-500 mt-1">نیاز به تصحیح (تشریحی)</div>
        </div>
        <div className="surface p-5 border-r-4 border-accent stat-card">
          <div className="text-3xl font-extrabold text-accent-dark">{dashboard?.stats?.total_tests ?? 0}</div>
          <div className="text-xs text-neutral-500 mt-1">آزمون‌های طراحی شده</div>
        </div>
      </div>

      <div className="surface p-6 border-neutral-200/80">
        <h3 className="section-title mb-4 text-center text-neutral-800">دسترسی سریع</h3>
        <div className="grid md:grid-cols-4 gap-3 text-sm">
          <Link to="/teacher/contents" className="rounded-xl bg-primary-soft p-4 text-center text-primary font-medium hover:bg-primary/10 transition">بارگذاری محتوای آموزشی</Link>
          <Link to="/teacher/tests" className="rounded-xl bg-primary-soft p-4 text-center text-primary font-medium hover:bg-primary/10 transition">مدیریت کل آزمون‌ها</Link>
          <Link to="/teacher/grading" className="rounded-xl bg-secondary-soft p-4 text-center text-secondary font-medium hover:bg-secondary/10 transition">تصحیح پاسخ‌های تشریحی</Link>
          <Link to="/teacher/tests/create" className="rounded-xl bg-primary p-4 text-center text-white font-medium hover:bg-primary-dark transition">ساخت آزمون جدید</Link>
        </div>
      </div>

      <div className="surface p-6 border-neutral-200/80">
        <h3 className="section-title mb-3 text-neutral-800">گزارش شهروند</h3>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="شناسه شهروند"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <Button onClick={loadReport}>نمایش گزارش</Button>
          <Button variant="secondary" disabled>گزارش همه</Button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          فعلا فقط گزارش یک شهروند با شناسه قابل دریافت است (بک‌اند گزارش همه را ندارد).
        </p>
        {report && (
          <pre className="mt-4 text-xs bg-primary-soft/30 p-4 rounded-xl overflow-auto border border-primary/10">{JSON.stringify(report, null, 2)}</pre>
        )}
      </div>
    </div>
  );
}
