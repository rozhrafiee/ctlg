import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';

export const useAdaptiveLearning = () => {
  const [dashboard, setDashboard] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دریافت داشبورد تطبیقی
  const fetchDashboard = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive-learning/dashboard/');
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    }
  };

  // دریافت مسیر یادگیری
  const fetchLearningPath = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive-learning/learning-path/');
      setLearningPath(data);
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت مسیر یادگیری');
    }
  };

  // دریافت پیشنهادات
  const fetchRecommendations = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive-learning/recommended/');
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    }
  };

  // دریافت پیشرفت
  const fetchProgress = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive-learning/progress/');
      setProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setProgress([]);
    }
  };

  // بروزرسانی پیشرفت محتوا
  const updateProgress = async (contentId, percent) => {
    try {
      await axiosInstance.post(`/adaptive-learning/content/${contentId}/progress/`, {
        percent,
      });
      await fetchProgress();
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  };

  // ریست کردن مسیر یادگیری
  const resetLearningPath = async () => {
    try {
      const { data } = await axiosInstance.post('/adaptive-learning/learning-path/reset/');
      setLearningPath(data);
      return data;
    } catch (err) {
      console.error('Error resetting learning path:', err);
      throw err;
    }
  };

  // کلیک روی پیشنهاد
  const markRecommendationClicked = async (recommendationId) => {
    try {
      await axiosInstance.post(`/adaptive-learning/recommendations/${recommendationId}/click/`);
    } catch (err) {
      console.error('Error marking recommendation:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchLearningPath(),
        fetchRecommendations(),
        fetchProgress(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    dashboard,
    learningPath,
    recommendations,
    progress,
    loading,
    isLoading: loading,
    error,
    updateProgress,
    resetLearningPath,
    markRecommendationClicked,
    refetch: () => {
      fetchDashboard();
      fetchLearningPath();
      fetchRecommendations();
      fetchProgress();
    },
  };
};
