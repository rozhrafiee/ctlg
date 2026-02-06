import { useState, useEffect } from 'react';
import axiosInstance from '@/api/axios';

export const useAdaptiveLearning = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دریافت مسیر یادگیری
  const fetchLearningPath = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive/learning-path/');
      setLearningPath(data);
    } catch (err) {
      console.error('Error fetching learning path:', err);
      setError(err.response?.data?.detail || 'خطا در دریافت مسیر یادگیری');
    }
  };

  // دریافت پیشنهادات
  const fetchRecommendations = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive/recommended/');
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  // دریافت پیشرفت
  const fetchProgress = async () => {
    try {
      const { data } = await axiosInstance.get('/adaptive/progress/');
      setProgress(data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  // بروزرسانی پیشرفت محتوا
  const updateProgress = async (contentId, percent) => {
    try {
      await axiosInstance.post(`/adaptive/content/${contentId}/progress/`, {
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
      const { data } = await axiosInstance.post('/adaptive/learning-path/reset/');
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
      await axiosInstance.post(`/adaptive/recommendations/${recommendationId}/click/`);
    } catch (err) {
      console.error('Error marking recommendation:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLearningPath(),
        fetchRecommendations(),
        fetchProgress(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    learningPath,
    recommendations,
    progress,
    loading,
    error,
    updateProgress,
    resetLearningPath,
    markRecommendationClicked,
    refetch: () => {
      fetchLearningPath();
      fetchRecommendations();
      fetchProgress();
    },
  };
};
