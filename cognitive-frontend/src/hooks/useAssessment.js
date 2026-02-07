import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availableTests, setAvailableTests] = useState([]);
  const [testHistory, setTestHistory] = useState([]);

  // ================== STUDENT METHODS ==================
  
  const fetchAvailableTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/assessment/tests/');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTestHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/assessment/my-history/');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/assessment/tests/${testId}/start/`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (sessionId, questionId, answerData) => {
    try {
      const response = await api.post(
        `/assessment/sessions/${sessionId}/questions/${questionId}/answer/`,
        answerData
      );
      return response.data;
    } catch (err) {
      console.error('Error submitting answer:', err);
      throw err;
    }
  };

  const finishTest = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/assessment/sessions/${sessionId}/finish/`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTestResult = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/assessment/student/results/${sessionId}/`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================== TEACHER METHODS ==================

  // لیست تمام آزمون‌های استاد
  const fetchTeacherTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/assessment/teacher/tests/all/');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ایجاد آزمون جدید
  const createTest = async (testData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/assessment/teacher/tests/create/', testData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ایجاد آزمون تعیین سطح
  const createPlacementTest = async (testData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/assessment/teacher/tests/placement/create/', testData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ویرایش آزمون
  const updateTest = async (testId, testData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/assessment/teacher/tests/update/${testId}/`, testData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف آزمون
  const deleteTest = async (testId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/assessment/teacher/tests/delete/${testId}/`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // دریافت لیست سوالات یک آزمون
  const fetchTestQuestions = async (testId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/assessment/teacher/tests/${testId}/questions/list/`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // اضافه کردن سوال به آزمون
  const addQuestion = async (testId, questionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/assessment/teacher/tests/${testId}/questions/`, questionData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ویرایش سوال
  const updateQuestion = async (questionId, questionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/assessment/teacher/questions/${questionId}/update/`, questionData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // حذف سوال
  const deleteQuestion = async (questionId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/assessment/teacher/questions/${questionId}/delete/`);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // لیست آزمون‌های در انتظار تصحیح
  const fetchPendingReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/assessment/teacher/reviews/pending/');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // دریافت جزئیات یک session برای تصحیح (معلم)
  const fetchSessionDetails = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/assessment/teacher/sessions/${sessionId}/`);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ثبت نمره دستی
  const submitManualGrade = async (sessionId, grades) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/assessment/teacher/sessions/${sessionId}/grade/`, { grades });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // بارگذاری آزمون‌های موجود و سوابق برای داشبورد دانش‌آموز
  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);
        const [testsRes, historyRes] = await Promise.all([
          api.get('/assessment/tests/').catch(() => ({ data: [] })),
          api.get('/assessment/my-history/').catch(() => ({ data: [] })),
        ]);
        const tests = Array.isArray(testsRes?.data) ? testsRes.data : (testsRes?.data?.results ?? []);
        const history = Array.isArray(historyRes?.data) ? historyRes.data : (historyRes?.data?.results ?? []);
        setAvailableTests(tests);
        setTestHistory(history);
      } catch {
        setAvailableTests([]);
        setTestHistory([]);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, []);

  return {
    loading,
    isLoading: loading,
    error,
    availableTests,
    testHistory,
    // Student methods
    fetchAvailableTests,
    fetchTestHistory,
    startTest,
    submitAnswer,
    finishTest,
    fetchTestResult,
    // Teacher methods
    fetchTeacherTests,
    createTest,
    createPlacementTest,
    updateTest,
    deleteTest,
    fetchTestQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    fetchPendingReviews,
    fetchSessionDetails,
    submitManualGrade
  };
};
