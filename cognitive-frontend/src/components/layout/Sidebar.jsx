import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../ui/Badge';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
    isActive ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-100'
  }`;

export default function Sidebar({ isMobileOpen, onClose, mobileOnly }) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const nav = (
    <>
      <div className="px-6 py-6">
        <div className="text-lg font-extrabold text-neutral-900">سامانه سنجش شناختی</div>
        <p className="mt-1 text-xs text-neutral-500">داشبورد هوشمند</p>
      </div>

      <nav className="px-4 space-y-1 overflow-y-auto flex-1">
        <NavLink to={isTeacher ? "/teacher/dashboard" : "/student/dashboard"} className={linkClass} onClick={onClose}>
          نمای کلی
        </NavLink>

        {!isTeacher && (
          <>
            {user?.has_taken_placement_test ? (
              <>
                <NavLink to="/student/tests" className={linkClass} onClick={onClose}>آزمون‌ها</NavLink>
                <NavLink to="/student/learning-path" className={linkClass} onClick={onClose}>مسیر یادگیری</NavLink>
                <NavLink to="/student/progress" className={linkClass} onClick={onClose}>پیشرفت</NavLink>
                <NavLink to="/student/recommended" className={linkClass} onClick={onClose}>پیشنهادهای هوشمند</NavLink>
                <NavLink to="/student/history" className={linkClass} onClick={onClose}>تاریخچه</NavLink>
              </>
            ) : (
              <NavLink to="/student/placement-test" className={linkClass} onClick={onClose}>آزمون تعیین سطح</NavLink>
            )}
          </>
        )}

        {isTeacher && (
          <>
            <NavLink to="/teacher/contents" className={linkClass} onClick={onClose}>محتوا</NavLink>
            <NavLink to="/teacher/tests" className={linkClass} onClick={onClose}>آزمون‌ها</NavLink>
            <NavLink to="/teacher/grading" className={linkClass} onClick={onClose}>تصحیح</NavLink>
          </>
        )}

        <NavLink to="/profile" className={linkClass} onClick={onClose}>پروفایل</NavLink>
      </nav>

      <div className="px-6 py-6 text-xs text-neutral-500 border-t border-neutral-100">
        <Badge tone="teal" className="mb-2">{user?.role === 'student' ? 'Citizen' : user?.role === 'teacher' ? 'مسئول شهری (مدرس)' : (user?.role || 'guest')}</Badge>
        <div className="truncate">{user?.username}</div>
      </div>
    </>
  );

  if (mobileOnly) {
    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-sm transition-opacity lg:hidden ${
            isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Mobile drawer */}
        <aside
          className={`fixed top-0 right-0 z-50 h-full w-72 max-w-[85vw] border-l border-neutral-200 bg-white shadow-elevated flex flex-col transition-transform duration-200 ease-out lg:hidden ${
            isMobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-neutral-100">
            <span className="font-bold text-neutral-900">منو</span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="بستن منو"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {nav}
        </aside>
      </>
    );
  }

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 border-l border-neutral-200 bg-white/95 backdrop-blur flex flex-col">
      {nav}
    </aside>
  );
}
