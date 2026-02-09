import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../ui/Badge';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Sidebar() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white/95 backdrop-blur">
      <div className="px-6 py-6">
        <div className="text-lg font-extrabold text-slate-900">Cog Learning</div>
        <p className="mt-1 text-xs text-slate-500">داشبورد هوشمند</p>
      </div>

      <nav className="px-4 space-y-1">
        <NavLink to={isTeacher ? "/teacher/dashboard" : "/student/dashboard"} className={linkClass}>
          نمای کلی
        </NavLink>

        {!isTeacher && (
          <>
            <NavLink to="/student/tests" className={linkClass}>آزمون‌ها</NavLink>
            <NavLink to="/student/learning-path" className={linkClass}>مسیر یادگیری</NavLink>
            <NavLink to="/student/progress" className={linkClass}>پیشرفت</NavLink>
            <NavLink to="/student/adaptive-dashboard" className={linkClass}>داشبورد تطبیقی</NavLink>
            <NavLink to="/student/recommended" className={linkClass}>پیشنهادهای هوشمند</NavLink>
            <NavLink to="/student/recommendations" className={linkClass}>پیشنهادها</NavLink>
            <NavLink to="/student/history" className={linkClass}>تاریخچه</NavLink>
          </>
        )}

        {isTeacher && (
          <>
            <NavLink to="/teacher/contents" className={linkClass}>محتوا</NavLink>
            <NavLink to="/teacher/tests" className={linkClass}>آزمون‌ها</NavLink>
            <NavLink to="/teacher/grading" className={linkClass}>تصحیح</NavLink>
          </>
        )}

        <NavLink to="/profile" className={linkClass}>پروفایل</NavLink>
      </nav>

      <div className="mt-auto px-6 py-6 text-xs text-slate-500">
        <Badge tone="teal" className="mb-2">{user?.role || 'guest'}</Badge>
        <div>{user?.username}</div>
      </div>
    </aside>
  );
}
