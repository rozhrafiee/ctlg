import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="container-shell grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <div className="soft-pill bg-brand-soft text-brand">
            سکوی شناختی هوشمند
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            مسیر یادگیری هوشمند برای رشد شناختی
          </h1>
          <p className="text-sm text-slate-600">
            آزمون‌ها، محتوا و تحلیل‌های دقیق برای رشد مهارت‌های شناختی شما.
          </p>
          <div className="flex gap-3">
            <Link to="/login"><Button>ورود</Button></Link>
            <Link to="/register"><Button variant="secondary">ثبت‌نام</Button></Link>
          </div>
        </div>
        <div className="surface p-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">۳×</div>
              رشد مهارتی سریع‌تر
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">۲۴/۷</div>
              دسترسی به محتوا
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">۱۰۰+</div>
              داده تحلیلی دقیق
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xl font-bold text-slate-900">۴</div>
              سطح رتبه‌بندی
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
