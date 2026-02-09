import axios from "axios";

/* ===============================
   Axios Base Config
================================ */
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ===============================
   Inject JWT Token
================================ */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ===============================
   Auth API ✅ (accounts/urls.py)
================================ */
export const authAPI = {
  login: (data) => api.post("accounts/login/", data),
  register: (data) => api.post("accounts/register/", data),
  getMe: () => api.get("accounts/profile/"),
  updateProfile: (data) => api.patch("accounts/profile/", data),
};

/* ===============================
   Assessment API ✅ (assessment/urls.py)
================================ */
export const assessmentAPI = {
  /* ---------- Student ---------- */

  getAvailableTests: () => api.get("assessment/tests/"),

  getTestDetail: (testId) =>
    api.get(`assessment/tests/${testId}/`),

  startTest: (testId) =>
    api.post(`assessment/tests/${testId}/start/`),

  submitAnswer: (sessionId, questionId, data) =>
    api.post(
      `assessment/sessions/${sessionId}/questions/${questionId}/answer/`,
      data
    ),

  finishTest: (sessionId) =>
    api.post(`assessment/sessions/${sessionId}/finish/`),

  getStudentResult: (resultId) =>
    api.get(`assessment/student/results/${resultId}/`),

  getMyHistory: () =>
    api.get("assessment/my-history/"),

  /* ---------- Teacher ---------- */

  listTests: () =>
    api.get("assessment/teacher/tests/all/"),

  getTestDetails: (id) =>
    api.get(`assessment/teacher/tests/update/${id}/`),

  // ✅ ایجاد آزمون عادی (FIXED)
  createTest: (data) =>
    api.post("assessment/teacher/tests/create/", data),

  // ✅ ویرایش آزمون (FIXED)
  updateTest: (id, data) =>
    api.put(`assessment/teacher/tests/update/${id}/`, data),

  createPlacementTest: (data) =>
    api.post("assessment/teacher/tests/placement/create/", data),

  createTestForContent: (contentId, data) =>
    api.post(
      `assessment/content/${contentId}/test/create/`,
      data
    ),

  getTestQuestions: (testId) =>
    api.get(
      `assessment/teacher/tests/${testId}/questions/list/`
    ),

  addQuestion: (testId, data) =>
    api.post(
      `assessment/teacher/tests/${testId}/questions/`,
      data
    ),

  deleteQuestion: (questionId) =>
    api.delete(
      `assessment/teacher/questions/${questionId}/delete/`
    ),

  getPendingReviews: () =>
    api.get("assessment/teacher/reviews/pending/"),

  getSessionDetails: (sessionId) =>
    api.get(
      `assessment/teacher/sessions/${sessionId}/`
    ),

  submitGrade: (sessionId, data) =>
    api.post(
      `assessment/teacher/sessions/${sessionId}/grade/`,
      data
    ),
};

/* ===============================
   Adaptive Learning API ✅
================================ */
export const contentAPI = {
  getRecommendedContent: () =>
    api.get("adaptive-learning/recommended/"),

  getLearningPath: () =>
    api.get("adaptive-learning/learning-path/"),

  updateProgress: (contentId, data) =>
    api.post(
      `adaptive-learning/content/${contentId}/progress/`,
      data
    ),

  getContentDetails: (id) =>
    api.get(`adaptive-learning/content/${id}/`),

  listTeacherContents: () =>
    api.get("adaptive-learning/teacher/contents/"),

  createContent: (formData) =>
    api.post(
      "adaptive-learning/teacher/content/create/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ),

  updateContent: (id, formData) =>
    api.put(
      `adaptive-learning/teacher/content/${id}/update/`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    ),

  deleteContent: (id) =>
    api.delete(
      `adaptive-learning/teacher/content/${id}/delete/`
    ),
};

/* ===============================
   Analytics API ✅
================================ */
export const analyticsAPI = {
  studentDashboard: () =>
    api.get("analytics/student-dashboard/"),

  teacherDashboard: () =>
    api.get("analytics/teacher-dashboard/"),

  myStats: () =>
    api.get("analytics/my-stats/"),

  systemReport: () =>
    api.get("analytics/system-report/"),

  studentReport: (studentId) =>
    api.get(
      `analytics/student-report/${studentId}/`
    ),
};

export default api;
