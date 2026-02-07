import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// فرض می‌کنیم این کامپوننت‌ها/Alert از کتابخانه UI شما هستند
import { Button } from '@/components/ui/Button'; 
import { Alert } from '@/components/ui/Alert'; 
import '@/styles/login-page.css'; 


/**
 * 🔐 صفحه ورود (LoginPage)
 * 
 * این کامپوننت با منطق جدید AuthContext هماهنگ شده است:
 * - در صورت موفقیت، تابع login خودش مسیریابی را انجام می‌دهد.
 * - در صورت شکست، یک شیء خطا برمی‌گرداند که در اینجا مدیریت می‌شود.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  // استفاده از useAuth برای دسترسی به تابع login
  const { login } = useAuth(); 
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // پاک کردن خطا هنگام تایپ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // فراخوانی login و دریافت شیء نتیجه
    const result = await login(formData.username, formData.password);
    
    setIsLoading(false);

    // 👈 مدیریت خطا بر اساس شیء بازگشتی (به جای try/catch)
    if (!result.success) {
        setError(result.error || 'خطای نامشخص هنگام ورود رخ داد.');
    }
    // اگر result.success === true باشد، navigate قبلاً توسط AuthContext انجام شده است.
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* لوگو و عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            سامانه یادگیری شناختی
          </h1>
          <p className="text-gray-600">
            برای ادامه، وارد حساب کاربری خود شوید
          </p>
        </div>

        {/* فرم لاگین */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نمایش خطا */}
            {error && (
              <Alert variant="destructive">
                <p className="text-sm">{error}</p>
              </Alert>
            )}

            {/* نام کاربری */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                نام کاربری
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="نام کاربری خود را وارد کنید"
                disabled={isLoading}
              />
            </div>

            {/* رمز عبور */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="رمز عبور"
                disabled={isLoading}
              />
            </div>

            {/* دکمه لاگین */}
            <Button 
              type="submit" 
              className="w-full py-3 mt-4" 
              disabled={isLoading}
            >
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
          
          {/* لینک‌های کمکی */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm">
              حساب کاربری ندارید؟{' '}
              <Link 
                to="/register" // مسیر به صفحه ثبت‌نام که قبلاً در مورد آن صحبت کردیم
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                ثبت‌نام کنید
              </Link>
            </div>
            <div className="text-sm">
              <Link 
                to="/forgot-password" // اگر مسیر بازیابی رمز عبور دارید
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                رمز عبور را فراموش کرده‌اید؟
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
