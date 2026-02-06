import { useState } from 'react';
import apiClient from '../utils/api';

export const useAssessment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ================== STUDENT METHODS ==================
  
  const fetchAvailableTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/assessment/tests/');
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
      const response = await apiClient.get('/api/assessment/my-history/');
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
      const response = await apiClient.post(`/api/assessment/tests/${testId}/start/`);
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
      const response = await apiClient.post(
        `/api/assessment/sessions/${sessionId}/questions/${questionId}/answer/`,
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
      const response = await apiClient.post(`/api/assessment/sessions/${sessionId}/finish/`);
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
      const response = await apiClient.get(`/api/assessment/results/${sessionId}/`);
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
      const response = await apiClient.get('/api/assessment/teacher/tests/all/');
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
      const response = await apiClient.post('/api/assessment/teacher/tests/create/', testData);
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
      const response = await apiClient.post('/api/assessment/teacher/tests/placement/create/', testData);
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
      const response = await apiClient.patch(`/api/assessment/teacher/tests/update/${testId}/`, testData);
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
      await apiClient.delete(`/api/assessment/teacher/tests/delete/${testId}/`);
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
      const response = await apiClient.get(`/api/assessment/teacher/tests/${testId}/questions/list/`);
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
      const response = await apiClient.post(`/api/assessment/teacher/tests/${testId}/questions/`, questionData);
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
      const response = await apiClient.patch(`/api/assessment/teacher/questions/${questionId}/update/`, questionData);
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
      await apiClient.delete(`/api/assessment/teacher/questions/${questionId}/delete/`);
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
      const response = await apiClient.get('/api/assessment/teacher/reviews/pending/');
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // دریافت جزئیات یک session برای تصحیح
  const fetchSessionDetails = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/assessment/teacher/sessions/${sessionId}/`);
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
      const response = await apiClient.post(`/api/assessment/teacher/sessions/${sessionId}/grade/`, { grades });
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
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
