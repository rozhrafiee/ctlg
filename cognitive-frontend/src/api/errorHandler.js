// src/api/errorHandler.js
import { toast } from '@/components/ui/use-toast';

/**
 * 📝 نگاشت خطاهای رایج DRF به پیام‌های فارسی
 * 
 * این آبجکت شامل ترجمه‌های رایج‌ترین خطاهای Django REST Framework است
 */
export const ERROR_MESSAGES = {
  // Authentication & Permission
  'Authentication credentials were not provided.': 'لطفاً وارد حساب کاربری خود شوید',
  'Invalid token.': 'توکن نامعتبر است',
  'Token has expired.': 'نشست منقضی شده است',
  'You do not have permission to perform this action.': 'شما اجازه انجام این عملیات را ندارید',
  
  // Validation
  'This field is required.': 'این فیلد الزامی است',
  'This field may not be blank.': 'این فیلد نمی‌تواند خالی باشد',
  'This field may not be null.': 'این فیلد نمی‌تواند خالی باشد',
  'Enter a valid email address.': 'ایمیل معتبر وارد کنید',
  'Ensure this field has no more than': 'تعداد کاراکترها بیش از حد مجاز است',
  'Ensure this field has at least': 'تعداد کاراکترها کمتر از حد مجاز است',
  
  // User-specific
  'A user with that username already exists.': 'این نام کاربری قبلاً ثبت شده است',
  'Unable to log in with provided credentials.': 'نام کاربری یا رمز عبور اشتباه است',
  'No active account found with the given credentials': 'حساب کاربری فعالی یافت نشد',
  
  // Content
  'Not found.': 'یافت نشد',
  'Method not allowed.': 'این عملیات مجاز نیست',
  
  // Server
  'Internal server error.': 'خطای داخلی سرور',
  'Service temporarily unavailable.': 'سرویس موقتاً در دسترس نیست',
};

/**
 * 🔄 تبدیل پیام خطای انگلیسی به فارسی
 * 
 * @param {string} message - پیام خطا به انگلیسی
 * @returns {string} - پیام ترجمه شده یا همان پیام اصلی
 */
export const translateError = (message) => {
  if (!message) return 'خطای نامشخص';
  
  // جستجوی دقیق
  if (ERROR_MESSAGES[message]) {
    return ERROR_MESSAGES[message];
  }
  
  // جستجوی تطبیقی (برای پیام‌هایی که شامل متغیر هستند)
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(key) || key.includes(message)) {
      return value;
    }
  }
  
  return message; // اگر ترجمه‌ای یافت نشد، همان پیام اصلی
};

/**
 * 🎨 تعیین variant مناسب Toast بر اساس status code
 * 
 * @param {number} status - HTTP status code
 * @returns {string} - variant name for Toast component
 */
export const getToastVariant = (status) => {
  if (status >= 500) return 'destructive';
  if (status === 404) return 'warning';
  if (status === 403 || status === 401) return 'destructive';
  if (status >= 400) return 'destructive';
  if (status >= 200 && status < 300) return 'success';
  return 'default';
};

/**
 * 📋 استخراج و فرمت‌دهی خطاهای فیلدی DRF
 * 
 * DRF معمولاً خطاهای اعتبارسنجی را به صورت object می‌فرستد:
 * { "username": ["این فیلد الزامی است"], "email": ["ایمیل نامعتبر"] }
 * 
 * @param {object} errors - آبجکت خطاهای DRF
 * @returns {string} - رشته فرمت شده برای نمایش
 */
export const formatFieldErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return 'خطای نامشخص';
  
  const messages = [];
  
  for (const [field, fieldErrors] of Object.entries(errors)) {
    const translatedField = translateFieldName(field);
    const errorList = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
    
    errorList.forEach(error => {
      const translatedError = translateError(error);
      messages.push(`${translatedField}: ${translatedError}`);
    });
  }
  
  return messages.join('\n') || 'خطا در ورودی‌ها';
};

/**
 * 🏷️ ترجمه نام فیلدها به فارسی
 * 
 * @param {string} field - نام فیلد انگلیسی
 * @returns {string} - نام فیلد فارسی
 */
const translateFieldName = (field) => {
  const fieldNames = {
    username: 'نام کاربری',
    email: 'ایمیل',
    password: 'رمز عبور',
    first_name: 'نام',
    last_name: 'نام خانوادگی',
    title: 'عنوان',
    description: 'توضیحات',
    content: 'محتوا',
    level: 'سطح',
    category: 'دسته‌بندی',
    test_type: 'نوع آزمون',
    time_limit: 'زمان',
    passing_score: 'نمره قبولی',
    question_text: 'متن سوال',
    points: 'امتیاز',
    non_field_errors: 'خطا',
  };
  
  return fieldNames[field] || field;
};

/**
 * 🎯 تابع اصلی مدیریت خطا
 * 
 * این تابع می‌تواند به صورت مستقیم در try-catch استفاده شود
 * 
 * @param {Error} error - آبجکت خطا
 * @param {object} options - تنظیمات اختیاری
 * @returns {void}
 * 
 * @example
 * try {
 *   await api.post('/content/', data);
 * } catch (error) {
 *   handleApiError(error, { showToast: true });
 * }
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    customTitle = null,
    onAuthError = null,
  } = options;

  if (!error.response) {
    // خطای شبکه (عدم اتصال)
    if (showToast) {
      toast({
        variant: 'destructive',
        title: customTitle || 'خطای اتصال',
        description: 'لطفاً اتصال اینترنت خود را بررسی کنید',
      });
    }
    return;
  }

  const { status, data } = error.response;

  // 401 → خروج خودکار
  if (status === 401) {
    if (onAuthError) {
      onAuthError();
    } else {
      localStorage.clear();
      window.location.href = '/login';
    }
    return;
  }

  // استخراج پیام خطا
  let errorMessage = 'خطای نامشخص';

  if (data?.detail) {
    errorMessage = translateError(data.detail);
  } else if (data && typeof data === 'object') {
    errorMessage = formatFieldErrors(data);
  }

  // نمایش Toast
  if (showToast) {
    toast({
      variant: getToastVariant(status),
      title: customTitle || getErrorTitle(status),
      description: errorMessage,
    });
  }

  return {
    status,
    message: errorMessage,
    originalData: data,
  };
};

/**
 * 📌 تعیین عنوان مناسب برای Toast بر اساس status
 */
const getErrorTitle = (status) => {
  if (status === 400) return 'خطا در ورودی';
  if (status === 403) return 'دسترسی ممنوع';
  if (status === 404) return 'یافت نشد';
  if (status >= 500) return 'خطای سرور';
  return 'خطا';
};

/**
 * ✅ تابع کمکی برای نمایش پیام موفقیت
 * 
 * @param {string} message - پیام موفقیت
 * @param {string} title - عنوان (اختیاری)
 * 
 * @example
 * showSuccessToast('محتوا با موفقیت ایجاد شد');
 */
export const showSuccessToast = (message, title = 'موفق') => {
  toast({
    variant: 'success',
    title,
    description: message,
  });
};

/**
 * ⚠️ تابع کمکی برای نمایش پیام هشدار
 */
export const showWarningToast = (message, title = 'توجه') => {
  toast({
    variant: 'warning',
    title,
    description: message,
  });
};

/**
 * ℹ️ تابع کمکی برای نمایش پیام اطلاعاتی
 */
export const showInfoToast = (message, title = 'اطلاعات') => {
  toast({
    variant: 'info',
    title,
    description: message,
  });
};
