import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  FileText,
  ClipboardList,
  Award,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // تابع تعیین لقب بر اساس سطح شناختی (۱-۱۰۰)
  const getLevelBadge = (level) => {
    if (level >= 90) {
      return { text: 'الماس شناختی', color: 'bg-gradient-to-r from-blue-500 to-purple-600' };
    }
    if (level >= 75) {
      return { text: 'طلایی', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600' };
    }
    if (level >= 50) {
      return { text: 'نقره‌ای', color: 'bg-gradient-to-r from-gray-300 to-gray-500' };
    }
    if (level >= 25) {
      return { text: 'برنزی', color: 'bg-gradient-to-r from-orange-400 to-orange-600' };
    }
    return { text: 'نوآموز', color: 'bg-gradient-to-r from-green-400 to-green-600' };
  };

  const badge = getLevelBadge(user?.cognitive_level || 1);

  // منوهای مخصوص دانش‌آموز
  const studentLinks = [
    { to: '/dashboard', icon: Home, label: 'داشبورد' },
    { to: '/tests', icon: ClipboardList, label: 'آزمون‌ها' },
    { to: '/learning-path', icon: BookOpen, label: 'مسیر یادگیری' },
    { to: '/progress', icon: BarChart3, label: 'پیشرفت من' },
  ];

  // منوهای مخصوص استاد
  const teacherLinks = [
    { to: '/teacher/dashboard', icon: Home, label: 'داشبورد استاد' },
    { to: '/teacher/contents', icon: BookOpen, label: 'مدیریت محتوا' },
    { to: '/teacher/tests', icon: ClipboardList, label: 'مدیریت آزمون‌ها' },
    { to: '/teacher/grading', icon: Award, label: 'تصحیح آزمون‌ها' },
  ];

  // انتخاب منوی مناسب
  const links = user?.role === 'teacher' || user?.role === 'admin' 
    ? teacherLinks 
    : studentLinks;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* لوگو و نام سیستم */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <Award className="w-8 h-8" />
            <span>سیستم یادگیری هوشمند</span>
          </Link>

          {/* منوی دسکتاپ */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* پروفایل کاربر */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* نمایش سطح و لقب (فقط برای دانش‌آموز) */}
            {user?.role === 'student' && (
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}>
                  {badge.text}
                </div>
                <span className="text-gray-600 text-sm">
                  سطح {user?.cognitive_level || 1}
                </span>
              </div>
            )}

            {/* منوی کاربر */}
            <div className="flex items-center gap-2 border-r pr-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'teacher' || user?.role === 'admin' ? 'استاد' : 'دانش‌آموز'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="پروفایل"
                >
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 transition-colors"
                  title="خروج"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>

          {/* دکمه منوی موبایل */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* منوی موبایل */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="py-4 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">{link.label}</span>
                  </Link>
                );
              })}

              {/* نمایش سطح در موبایل */}
              {user?.role === 'student' && (
                <div className="px-4 py-2 border-t mt-2 pt-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${badge.color}`}>
                    {badge.text} - سطح {user?.cognitive_level || 1}
                  </div>
                </div>
              )}

              {/* پروفایل و خروج */}
              <div className="border-t pt-4 mt-2 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">پروفایل من</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
