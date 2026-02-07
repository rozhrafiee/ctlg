import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import "@/styles/global-styles.css";
import '@/styles/register-page.css'; // ← فقط این خط!

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'نام کاربری الزامی است';
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'ایمیل معتبر وارد کنید';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    }

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'رمز عبور و تکرار آن یکسان نیستند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // ✅ حذف password_confirm قبل از ارسال
      const { password_confirm, ...registerData } = formData;
      
      console.log('📤 Sending to backend:', registerData);
      
      // ✅ مسیر درست: /accounts/register/ (چون baseURL = /api)
      const response = await api.post('/accounts/register/', registerData);
      
      console.log('✅ Response:', response.data);
      
      setSuccessMessage('ثبت‌نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Registration error:', err.response?.data);
      
      if (err.response?.data) {
        // نمایش خطاهای بکند
        const backendErrors = err.response.data;
        
        if (typeof backendErrors === 'object') {
          setErrors(backendErrors);
        } else {
          setErrors({ general: backendErrors });
        }
      } else {
        setErrors({
          general: 'خطایی در ثبت‌نام رخ داد. لطفاً دوباره تلاش کنید',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* لوگو و عنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ثبت‌نام در سامانه
          </h1>
          <p className="text-gray-600">
            برای شروع یادگیری، حساب کاربری بسازید
          </p>
        </div>

        {/* فرم ثبت‌نام */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* پیام موفقیت */}
            {successMessage && (
              <Alert variant="success">
                <p className="text-sm">{successMessage}</p>
              </Alert>
            )}

            {/* خطای عمومی */}
            {errors.general && (
              <Alert variant="destructive">
                <p className="text-sm">{errors.general}</p>
              </Alert>
            )}

            {/* نام و نام خانوادگی */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام
                </label>
                <input
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="نام"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خانوادگی
                </label>
                <input
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="نام خانوادگی"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>

            {/* نام کاربری */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری *
              </label>
              <input
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="نام کاربری"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            {/* ایمیل */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل *
              </label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* نقش */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نقش *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">دانش‌آموز</option>
                <option value="teacher">استاد</option>
              </select>
            </div>

            {/* رمز عبور */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور *
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="حداقل 8 کاراکتر"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور *
                </label>
                <input
                  name="password_confirm"
                  type="password"
                  required
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="تکرار رمز عبور"
                />
                {errors.password_confirm && (
                  <p className="text-red-500 text-sm mt-1">{errors.password_confirm}</p>
                )}
              </div>
            </div>

            {/* دکمه ثبت‌نام */}
            <Button
              type="submit"
              className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </Button>
          </form>

          {/* لینک لاگین */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                وارد شوید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
