import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/api';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStudent, setIsStudent] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [authError, setAuthError] = useState(null);

  const navigate = useNavigate();

  // به‌روزرسانی وضعیت‌های نقش بر اساس کاربر
  useEffect(() => {
    if (user) {
      setIsStudent(user.role === 'student');
      setIsTeacher(user.role === 'teacher');
      setIsAdmin(user.role === 'admin');
    } else {
      setIsStudent(false);
      setIsTeacher(false);
      setIsAdmin(false);
    }
  }, [user]);

  const isAuthenticated = !!user;

  // --- عملیات اولیه: بررسی توکن در زمان بارگذاری ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // اضافه کردن header برای احراز هویت
          const response = await apiClient.get('/accounts/profile/', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          // بررسی ساختار response
          if (response && response.data) {
            setUser(response.data);
          } else {
            console.error('پاسخ سرور ساختار نامعتبر دارد:', response);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('خطا در بازیابی پروفایل اولیه:', error);
          console.error('جزئیات خطا:', error.response?.data);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // --- تابع ورود (Login) ---
  const login = async (username, password) => {
    setAuthError(null); // پاک کردن خطاهای قبلی
    try {
      // لاگ کردن درخواست
      console.log('در حال ارسال درخواست ورود به:', '/accounts/login/');
      console.log('داده‌ها:', { username, password });
      
      const response = await apiClient.post('/accounts/login/', {
        username,
        password,
      });
      
      // لاگ کردن پاسخ
      console.log('پاسخ سرور:', response);
      console.log('داده‌های پاسخ:', response.data);
      
      // بررسی ساختار پاسخ
      if (!response || !response.data) {
        throw new Error('پاسخ سرور خالی است');
      }
      
      // استخراج داده‌ها از پاسخ - بررسی چندین ساختار ممکن
      const data = response.data;
      
      // ساختار 1: {access, refresh, user}
      // ساختار 2: {token, user}
      // ساختار 3: {access_token, refresh_token, user}
      
      let accessToken, refreshToken, userData;
      
      if (data.access && data.refresh) {
        // ساختار Django JWT استاندارد
        accessToken = data.access;
        refreshToken = data.refresh;
        userData = data.user;
      } else if (data.access_token && data.refresh_token) {
        // ساختار alternative
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        userData = data.user;
      } else if (data.token) {
        // ساختار simple token
        accessToken = data.token;
        refreshToken = null;
        userData = data.user;
      } else {
        console.error('ساختار پاسخ نامعتبر است:', data);
        throw new Error('ساختار پاسخ سرور نامعتبر است');
      }
      
      // ذخیره توکن‌ها
      localStorage.setItem('access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      
      // اگر user در پاسخ نیست، یک درخواست جداگانه برای دریافت پروفایل بزن
      if (!userData) {
        try {
          const profileResponse = await apiClient.get('/accounts/profile/', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          userData = profileResponse.data;
        } catch (profileError) {
          console.error('خطا در دریافت پروفایل کاربر:', profileError);
        }
      }
      
      if (userData) {
        setUser(userData);
        
        // مسیریابی پس از ورود موفق
        if (userData.role === 'student') {
          if (userData.has_taken_placement_test === false) {
            navigate('/placement-test');
          } else {
            navigate('/dashboard');
          }
        } else if (userData.role === 'teacher' || userData.role === 'admin') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/');
        }
      }

      return { success: true, data: userData };
      
    } catch (error) {
      console.error('خطا در ورود:', error);
      
      // لاگ کردن جزئیات خطا
      if (error.response) {
        console.error('وضعیت خطا:', error.response.status);
        console.error('داده‌های خطا:', error.response.data);
        console.error('هدرهای خطا:', error.response.headers);
      } else if (error.request) {
        console.error('هیچ پاسخی دریافت نشد:', error.request);
      } else {
        console.error('خطا در تنظیم درخواست:', error.message);
      }
      
      // تنظیم پیغام خطا
      let errorMessage = 'نام کاربری یا رمز عبور اشتباه است.';
      
      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            errorMessage = error.response.data.detail;
          } else if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // --- تابع ثبت نام (Register) ---
  const register = async (userData) => {
    setAuthError(null);
    try {
      console.log('در حال ثبت نام کاربر:', userData);
      
      const response = await apiClient.post('/accounts/register/', userData);
      console.log('پاسخ ثبت نام:', response.data);
      
      // اگر ثبت‌نام موفق بود، سعی کن وارد شوی
      if (response.status === 201 || response.status === 200) {
        return await login(userData.username, userData.password);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('خطا در ثبت نام:', error);
      
      let errorMessage = 'خطای ناشناخته در ثبت نام.';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // بررسی انواع خطاها
        if (data.username) {
          errorMessage = `نام کاربری: ${data.username[0]}`;
        } else if (data.email) {
          errorMessage = `ایمیل: ${data.email[0]}`;
        } else if (data.password) {
          errorMessage = `رمز عبور: ${data.password[0]}`;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = data.non_field_errors[0];
        }
      }
      
      setAuthError(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  // --- تابع خروج (Logout) ---
  const logout = useCallback(async () => {
    try {
      // اگر سرور endpoint برای logout دارد، آن را صدا بزن
      await apiClient.post('/accounts/logout/');
    } catch (error) {
      console.warn('خطا در خروج از سرور:', error);
    } finally {
      // پاک کردن localStorage بدون توجه به پاسخ سرور
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setAuthError(null);
      navigate('/login');
    }
  }, [navigate]);

  // --- به‌روزرسانی کاربر ---
  const updateUser = useCallback(async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await apiClient.get('/accounts/profile/', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (response && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("خطا در به‌روزرسانی اطلاعات کاربر:", error);
      // اگر خطای احراز هویت بود، کاربر را logout کن
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [user, logout]);

  // --- تابع refresh token ---
  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/accounts/token/refresh/', {
        refresh: refreshToken
      });
      
      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('خطا در رفرش توکن:', error);
      logout();
      return null;
    }
  }, [logout]);

  const value = {
    user,
    loading,
    authError,
    login,
    register,
    logout,
    updateUser,
    refreshAccessToken,
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};