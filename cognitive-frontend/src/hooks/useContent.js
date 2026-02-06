import { useState } from 'react';
import api from '../utils/api';

export function useContent() {
  const [loading, setLoading] = useState(false);

  // لیست محتواها (برای استاد)
  const fetchTeacherContents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/adaptive/teacher/contents/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // جزئیات یک محتوا
  const fetchContentDetail = async (id) => {
    try {
      const response = await api.get(`/api/adaptive/content/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch content detail:', error);
      throw error;
    }
  };

  // ایجاد محتوای جدید
  const createContent = async (data) => {
    try {
      const response = await api.post('/api/adaptive/teacher/contents/', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create content:', error);
      throw error;
    }
  };

  // ویرایش محتوا
  const updateContent = async (id, data) => {
    try {
      const response = await api.put(`/api/adaptive/content/${id}/update/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update content:', error);
      throw error;
    }
  };

  // حذف محتوا
  const deleteContent = async (id) => {
    try {
      await api.delete(`/api/adaptive/content/${id}/delete/`);
    } catch (error) {
      console.error('Failed to delete content:', error);
      throw error;
    }
  };

  // ایجاد آزمون برای محتوا
  const createTestForContent = async (contentId) => {
    try {
      const response = await api.post(`/api/assessment/content/${contentId}/create-test/`);
      return response.data;
    } catch (error) {
      console.error('Failed to create test:', error);
      throw error;
    }
  };

  // لیست سوالات یک آزمون
  const fetchTestQuestions = async (testId) => {
    try {
      const response = await api.get(`/api/assessment/test/${testId}/questions/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      throw error;
    }
  };

  // اضافه کردن سوال به آزمون
  const addQuestion = async (testId, questionData) => {
    try {
      const response = await api.post(`/api/assessment/test/${testId}/add-question/`, questionData);
      return response.data;
    } catch (error) {
      console.error('Failed to add question:', error);
      throw error;
    }
  };

  // ویرایش سوال
  const updateQuestion = async (questionId, data) => {
    try {
      const response = await api.put(`/api/assessment/question/${questionId}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  };

  // حذف سوال
  const deleteQuestion = async (questionId) => {
    try {
      await api.delete(`/api/assessment/question/${questionId}/delete/`);
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  };

  return {
    loading,
    fetchTeacherContents,
    fetchContentDetail,
    createContent,
    updateContent,
    deleteContent,
    createTestForContent,
    fetchTestQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
  };
}
