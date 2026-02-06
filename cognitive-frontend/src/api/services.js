// src/api/services.js
import api from './axios';
import { handleApiError, showSuccessToast } from './errorHandler';

/**
 * 🎓 Student APIs
 */
export const studentAPI = {
  /**
   * دریافت محتوای پیشنهادی
   */
  getRecommendedContent: async () => {
    try {
      const response = await api.get('/adaptive-learning/recommended-content/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت مسیر یادگیری
   */
  getLearningPath: async () => {
    try {
      const response = await api.get('/adaptive-learning/learning-path/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ریست کردن مسیر یادگیری
   */
  resetLearningPath: async () => {
    try {
      const response = await api.post('/adaptive-learning/reset-learning-path/');
      showSuccessToast('مسیر یادگیری با موفقیت بازنشانی شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * به‌روزرسانی پیشرفت محتوا
   */
  updateProgress: async (contentId, percent) => {
    try {
      const response = await api.post(`/adaptive-learning/update-progress/${contentId}/`, {
        percent,
      });
      if (percent >= 100) {
        showSuccessToast('محتوا به اتمام رسید');
      }
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * علامت‌گذاری پیشنهاد به عنوان کلیک شده
   */
  markRecommendationClicked: async (recommendationId) => {
    try {
      const response = await api.post(
        `/adaptive-learning/mark-recommendation-clicked/${recommendationId}/`
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت داشبورد تطبیقی
   */
  getDashboard: async () => {
    try {
      const response = await api.get('/adaptive-learning/adaptive-dashboard/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت جزئیات محتوا
   */
  getContentDetail: async (contentId) => {
    try {
      const response = await api.get(`/adaptive-learning/content/${contentId}/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت تاریخچه آزمون‌ها
   */
  getTestHistory: async () => {
    try {
      const response = await api.get('/assessment/my-history/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت نتیجه یک آزمون خاص
   */
  getTestResult: async (sessionId) => {
    try {
      const response = await api.get(`/assessment/results/${sessionId}/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * 📝 Test/Assessment APIs
 */
export const assessmentAPI = {
  /**
   * دریافت لیست آزمون‌های در دسترس
   */
  getAvailableTests: async () => {
    try {
      const response = await api.get('/assessment/tests/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * شروع یک جلسه آزمون
   */
  startTestSession: async (testId) => {
    try {
      const response = await api.post(`/assessment/tests/${testId}/start/`);
      showSuccessToast('آزمون شروع شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ارسال پاسخ به یک سوال
   */
  submitAnswer: async (sessionId, questionId, answerData) => {
    try {
      const response = await api.post(
        `/assessment/sessions/${sessionId}/questions/${questionId}/submit/`,
        answerData
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * پایان جلسه آزمون
   */
  finishTestSession: async (sessionId) => {
    try {
      const response = await api.post(`/assessment/sessions/${sessionId}/finish/`);
      showSuccessToast('آزمون به پایان رسید');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * 👨‍🏫 Teacher APIs - Content Management
 */
export const teacherContentAPI = {
  /**
   * دریافت لیست محتوای استاد
   */
  getMyContent: async () => {
    try {
      const response = await api.get('/adaptive-learning/teacher/content/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ایجاد محتوای جدید
   */
  createContent: async (contentData) => {
    try {
      const response = await api.post('/adaptive-learning/teacher/content/', contentData);
      showSuccessToast('محتوا با موفقیت ایجاد شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ویرایش محتوا
   */
  updateContent: async (contentId, contentData) => {
    try {
      const response = await api.put(
        `/adaptive-learning/teacher/content/${contentId}/`,
        contentData
      );
      showSuccessToast('محتوا با موفقیت به‌روزرسانی شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * حذف محتوا
   */
  deleteContent: async (contentId) => {
    try {
      await api.delete(`/adaptive-learning/teacher/content/${contentId}/`);
      showSuccessToast('محتوا با موفقیت حذف شد');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * 👨‍🏫 Teacher APIs - Test Management
 */
export const teacherTestAPI = {
  /**
   * دریافت لیست آزمون‌های استاد
   */
  getMyTests: async () => {
    try {
      const response = await api.get('/assessment/teacher/tests/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ایجاد آزمون جدید
   */
  createTest: async (testData) => {
    try {
      const response = await api.post('/assessment/teacher/tests/', testData);
      showSuccessToast('آزمون با موفقیت ایجاد شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ویرایش آزمون
   */
  updateTest: async (testId, testData) => {
    try {
      const response = await api.put(`/assessment/teacher/tests/${testId}/`, testData);
      showSuccessToast('آزمون با موفقیت به‌روزرسانی شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * حذف آزمون
   */
  deleteTest: async (testId) => {
    try {
      await api.delete(`/assessment/teacher/tests/${testId}/`);
      showSuccessToast('آزمون با موفقیت حذف شد');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * اضافه کردن سوال به آزمون
   */
  addQuestion: async (testId, questionData) => {
    try {
      const response = await api.post(
        `/assessment/teacher/tests/${testId}/questions/`,
        questionData
      );
      showSuccessToast('سوال با موفقیت اضافه شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ویرایش سوال
   */
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await api.put(
        `/assessment/teacher/questions/${questionId}/`,
        questionData
      );
      showSuccessToast('سوال با موفقیت به‌روزرسانی شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * حذف سوال
   */
  deleteQuestion: async (questionId) => {
    try {
      await api.delete(`/assessment/teacher/questions/${questionId}/`);
      showSuccessToast('سوال با موفقیت حذف شد');
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت لیست آزمون‌های در انتظار بررسی
   */
  getPendingReviews: async () => {
    try {
      const response = await api.get('/assessment/teacher/pending-reviews/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت جزئیات جلسه آزمون برای بررسی
   */
  getSessionDetails: async (sessionId) => {
    try {
      const response = await api.get(`/assessment/teacher/sessions/${sessionId}/`);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * ثبت نمرات دستی
   */
  submitManualGrade: async (sessionId, grades) => {
    try {
      const response = await api.post(`/assessment/teacher/sessions/${sessionId}/grade/`, {
        grades,
      });
      showSuccessToast('نمرات با موفقیت ثبت شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * 🔐 Auth APIs
 */
export const authAPI = {
  /**
   * ورود
   */
  login: async (username, password) => {
    try {
      const response = await api.post('/accounts/login/', { username, password });
      showSuccessToast('خوش آمدید');
      return response.data;
    } catch (error) {
      handleApiError(error, { customTitle: 'خطا در ورود' });
      throw error;
    }
  },

  /**
   * ثبت‌نام
   */
  register: async (userData) => {
    try {
      const response = await api.post('/accounts/register/', userData);
      showSuccessToast('ثبت‌نام با موفقیت انجام شد');
      return response.data;
    } catch (error) {
      handleApiError(error, { customTitle: 'خطا در ثبت‌نام' });
      throw error;
    }
  },

  /**
   * خروج
   */
  logout: () => {
    localStorage.clear();
    showSuccessToast('با موفقیت خارج شدید');
    window.location.href = '/login';
  },

  /**
   * دریافت پروفایل کاربر
   */
  getProfile: async () => {
    try {
      const response = await api.get('/accounts/profile/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * به‌روزرسانی پروفایل
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/accounts/profile/', profileData);
      showSuccessToast('پروفایل با موفقیت به‌روزرسانی شد');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * 📊 Admin APIs (if needed)
 */
export const adminAPI = {
  /**
   * دریافت آمار سیستم
   */
  getSystemStats: async () => {
    try {
      const response = await api.get('/admin/stats/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * دریافت لیست کاربران
   */
  getUsers: async () => {
    try {
      const response = await api.get('/admin/users/');
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};
