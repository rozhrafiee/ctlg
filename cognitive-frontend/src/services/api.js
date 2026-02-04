import axios from "axios";

// ایجاد یک نمونه Axios با baseURL ثابت
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// اینترسپتور برای تزریق توکن احراز هویت (Token Interceptor)
api.interceptors.request.use((config) => {
  // ✅ مطمئن می‌شویم از کلید "access" استفاده می‌شود (طبق Memory)
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================
   ✅ Auth API
   ===================== */
export const authAPI = {
  login: (data) =>
    api.post("accounts/login/", data),

  register: (data) =>
    api.post("accounts/register/", data),

  getMe: () =>
    api.get("accounts/profile/"),

  updateProfile: (data) =>
    api.patch("accounts/profile/", data),
};

/* =====================
   ✅ Assessment API (مدیریت آزمون و شرکت در آن)
   ===================== */
export const assessmentAPI = {
  // -------------------- Teacher Panel --------------------
  getTeacherTests: () =>
    api.get("assessment/teacher/tests/all/"), // Tested

  createTest: (data) =>
    api.post("assessment/teacher/tests/create/", data), // Tested

  createPlacementTest: (data) =>
    api.post("assessment/teacher/tests/placement/create/", data), // Tested

  updateTest: (id, data) =>
    api.put(`assessment/teacher/tests/update/${id}/`, data),

  deleteTest: (id) =>
    api.delete(`assessment/teacher/tests/delete/${id}/`),

  listQuestions: (testId) =>
    api.get(`assessment/teacher/tests/${testId}/questions/list/`),

  addQuestion: (testId, data) =>
    api.post(`assessment/teacher/tests/${testId}/questions/`, data), // Tested

  updateQuestion: (id, data) =>
    api.put(`assessment/teacher/questions/${id}/update/`, data),

  deleteQuestion: (id) =>
    api.delete(`assessment/teacher/questions/${id}/delete/`), // Tested

  // -------------------- Review & Grading --------------------
  getPendingReviews: () =>
    api.get("assessment/teacher/reviews/pending/"), // Tested

  submitManualGrade: (sessionId, data) =>
    api.post(`assessment/teacher/sessions/${sessionId}/grade/`, data), // Tested

  // ✅ اضافه شده: برای نمایش جزئیات session در پنل استاد (و دانشجو)
  getSessionDetails: (id) =>
    api.get(`/assessment/teacher/sessions/${id}/`),

  // -------------------- Student Participation --------------------
  // ✅ اضافه شده: برای شروع آزمون
  startTest: (testId) =>
    api.post(`assessment/tests/${testId}/start/`), // Tested

  // ✅ موجود بود: ثبت پاسخ سوال
  submitAnswer: (sessionId, questionId, data) =>
    api.post(
      `/assessment/sessions/${sessionId}/questions/${questionId}/answer/`,
      data
    ), // Tested

  // ✅ موجود بود: اتمام آزمون
  finishTest: (sessionId) =>
    api.post(`/assessment/sessions/${sessionId}/finish/`), // Tested

  // -------------------- Student Results --------------------
  // ✅ اضافه شده: کارنامه یک آزمون خاص (توسط دانشجو)
  getTestResultDetail: (sessionId) =>
    api.get(`assessment/results/${sessionId}/`), // Tested

  // ✅ اضافه شده: تاریخچه تمام آزمون‌های کاربر
  getStudentHistory: () =>
    api.get('assessment/my-history/'),

  // ✅ اضافه شده: جزئیات کارنامه دانشجو (برای لیست تاریخچه)
  getStudentTestDetail: (id) =>
    api.get(`assessment/student/results/${id}/`), // Tested
};

/* =====================
   ✅ Content / Adaptive Learning API
   ===================== */
export const contentAPI = {
  // لیست محتواهای قابل دسترس برای شهروند
  listContents: () =>
    api.get("adaptive-learning/contents/"),

  // مشاهده یک محتوای خاص
  getContentDetail: (id) =>
    api.get(`adaptive-learning/contents/${id}/`),

  // مسیر یادگیری فعال کاربر
  getMyLearningPath: () =>
    api.get("adaptive-learning/my-path/"),

  // ثبت پیشرفت مطالعه محتوا
  markContentCompleted: (contentId) =>
    api.post(`adaptive-learning/content/${contentId}/complete/`),

  // پیشنهادهای هوشمند (برای داشبورد دانشجو)
  getRecommendations: () =>
    api.get("adaptive-learning/recommendations/"),
};

/* =====================
   ✅ Analytics API (داشبوردها و آمار)
   ===================== */
export const analyticsAPI = {
  teacherDashboard: () =>
    api.get("analytics/teacher-dashboard/"),

  studentDashboard: () =>
    api.get("analytics/student-dashboard/"),

  myStats: () =>
    api.get("analytics/my-stats/"),
};

export default api;

