import { useState } from 'react';
import api from '../api/client';

export function useAssessment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    return [];
  };

  const request = async (fn) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    // Teacher tests
    fetchTeacherTests: () => request(() => api.get('/assessment/teacher/tests/all/')),
    createTest: (payload) => request(() => api.post('/assessment/teacher/tests/create/', payload)),
    createTestForContent: (contentId) =>
      request(() => api.post(`/assessment/content/${contentId}/test/create/`)),
    updateTest: (id, payload) => request(() => api.put(`/assessment/teacher/tests/update/${id}/`, payload)),
    deleteTest: (id) => request(() => api.delete(`/assessment/teacher/tests/delete/${id}/`)),
    getTestDetail: (id) => request(() => api.get(`/assessment/teacher/tests/update/${id}/`)),
    // Questions
    fetchTestQuestions: (testId) => request(() => api.get(`/assessment/teacher/tests/${testId}/questions/list/`)),
    addQuestion: (testId, payload) => request(() => api.post(`/assessment/teacher/tests/${testId}/questions/`, payload)),
    updateQuestion: (id, payload) => request(() => api.patch(`/assessment/teacher/questions/${id}/update/`, payload)),
    deleteQuestion: (id) => request(() => api.delete(`/assessment/teacher/questions/${id}/delete/`)),
    fetchPendingReviews: () => request(() => api.get('/assessment/teacher/reviews/pending/')),
    fetchSessionDetails: (sessionId) => request(() => api.get(`/assessment/teacher/sessions/${sessionId}/`)),
    submitManualGrade: (sessionId, grades) =>
      request(() => api.post(`/assessment/teacher/sessions/${sessionId}/grade/`, { grades })),
    // Student
    fetchAvailableTests: async () => {
      const data = await request(() => api.get('/assessment/tests/'));
      return normalizeList(data);
    },
    fetchTestDetail: (id) => request(() => api.get(`/assessment/tests/${id}/`)),
    startTest: (id) => request(() => api.post(`/assessment/tests/${id}/start/`)),
    submitAnswer: (sessionId, questionId, payload) =>
      request(() => api.post(`/assessment/sessions/${sessionId}/questions/${questionId}/answer/`, payload)),
    finishTest: (sessionId) => request(() => api.post(`/assessment/sessions/${sessionId}/finish/`)),
    fetchStudentResult: (sessionId) => request(() => api.get(`/assessment/student/results/${sessionId}/`)),
    fetchHistory: async () => {
      const data = await request(() => api.get('/assessment/my-history/'));
      return normalizeList(data);
    },
  };
}
