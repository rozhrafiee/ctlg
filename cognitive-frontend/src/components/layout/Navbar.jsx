import { Link, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isGuest = !user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const logoLink = isTeacher
    ? '/teacher/dashboard'
    : isStudent
    ? '/student/dashboard'
    : '/';

  return (
    <nav dir="rtl" className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Right: Logo + Menu */}
        <div className="flex items-center gap-10">

          {/* Logo */}
          <Link
            to={logoLink}
            className="text-xl font-bold text-indigo-600 whitespace-nowrap"
          >
            سیستم یادگیری هوشمند
          </Link>

          {/* Menu */}
          <div className="flex items-center gap-8 text-base font-medium text-gray-700">

            {isGuest && (
              <Link to="/" className="flex items-center gap-1 hover:text-indigo-600">
                <Home size={18} />
                خانه
              </Link>
            )}

            {isStudent && (
              <>
                <Link to="/student/dashboard" className="flex items-center gap-1 hover:text-indigo-600">
                  <LayoutDashboard size={18} />
                  داشبورد
                </Link>

                <Link to="/student/tests" className="flex items-center gap-1 hover:text-indigo-600">
                  <BookOpen size={18} />
                  آزمون‌ها
                </Link>

                <Link to="/student/learning-path" className="flex items-center gap-1 hover:text-indigo-600">
                  <GraduationCap size={18} />
                  مسیر یادگیری
                </Link>
              </>
            )}

            {isTeacher && (
              <>
                <Link to="/teacher/dashboard" className="flex items-center gap-1 hover:text-indigo-600">
                  <LayoutDashboard size={18} />
                  داشبورد استاد
                </Link>

                <Link to="/teacher/contents" className="flex items-center gap-1 hover:text-indigo-600">
                  <BookOpen size={18} />
                  محتواها
                </Link>

                <Link to="/teacher/tests" className="flex items-center gap-1 hover:text-indigo-600">
                  <GraduationCap size={18} />
                  آزمون‌ها
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Left: Profile & Logout */}
        <div className="flex items-center gap-5 text-base font-medium">

          {isGuest && (
            <>
              <Link to="/login" className="hover:text-indigo-600">
                ورود
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                ثبت‌نام
              </Link>
            </>
          )}

          {user && (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-1 text-gray-700 hover:text-indigo-600"
              >
                <User size={18} />
                پروفایل
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <LogOut size={18} />
                خروج
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
