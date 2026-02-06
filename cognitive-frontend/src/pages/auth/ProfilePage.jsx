import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/api/axios';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';

/**
 * 👤 صفحه پروفایل کاربر
 * 
 * ویژگی‌ها:
 * - نمایش اطلاعات کاربر
 * - ویرایش اطلاعات شخصی
 * - تغییر رمز عبور
 * - نمایش آمار (برای دانش‌آموز/استاد)
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // بارگذاری اطلاعات کاربر
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  // ذخیره تغییرات پروفایل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.patch('/accounts/profile/update/', formData);
      
      updateUser(response.data);
      
      setMessage({
        type: 'success',
        text: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
      });
      
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'خطا در به‌روزرسانی اطلاعات',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تغییر رمز عبور
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setMessage({
        type: 'error',
        text: 'رمز عبور جدید و تکرار آن یکسان نیستند',
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/accounts/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });

      setMessage({
        type: 'success',
        text: 'رمز عبور شما با موفقیت تغییر کرد',
      });

      setPasswordData({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'خطا در تغییر رمز عبور',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">پروفایل کاربری</h1>

      {/* نمایش پیام */}
      {message.text && (
        <Alert 
          variant={message.type === 'success' ? 'default' : 'destructive'}
          className="mb-6"
        >
          {message.text}
        </Alert>
      )}

      <div className="grid gap-6">
        {/* کارت اطلاعات کاربر */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">اطلاعات شخصی</h2>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  ویرایش
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* نام */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام
                  </label>
                  <input
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                {/* نام خانوادگی */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام خانوادگی
                  </label>
                  <input
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                {/* ایمیل */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ایمیل
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                  />
                </div>

                {/* نام کاربری (غیرقابل تغییر) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    value={user?.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>

                {/* نقش */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نقش
                  </label>
                  <input
                    type="text"
                    value={user?.role === 'teacher' ? 'استاد' : 'دانش‌آموز'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-4 mt-6">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    انصراف
                  </Button>
                </div>
              )}
            </form>
          </div>
        </Card>

        {/* کارت تغییر رمز عبور */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">تغییر رمز عبور</h2>

            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور فعلی
                  </label>
                  <input
                    name="old_password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رمز عبور جدید
                  </label>
                  <input
                    name="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تکرار رمز عبور جدید
                  </label>
                  <input
                    name="new_password_confirm"
                    type="password"
                    value={passwordData.new_password_confirm}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
              </Button>
            </form>
          </div>
        </Card>

        {/* کارت آمار (فقط برای دانش‌آموز) */}
        {user?.role === 'student' && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">آمار یادگیری</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {user?.cognitive_level || 50}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">سطح شناختی</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">-</div>
                  <div className="text-sm text-gray-600 mt-2">محتوای تکمیل شده</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">-</div>
                  <div className="text-sm text-gray-600 mt-2">آزمون‌های گذرانده</div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
