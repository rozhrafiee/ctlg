import { useState } from 'react';
import api from '../api/client';

export function useAdaptive() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // Citizen
    fetchRecommended: () => request(() => api.get('/adaptive-learning/recommended/')),
    fetchLearningPath: () => request(() => api.get('/adaptive-learning/learning-path/')),
    resetLearningPath: () => request(() => api.post('/adaptive-learning/learning-path/reset/')),
    fetchProgress: () => request(() => api.get('/adaptive-learning/progress/')),
    updateProgress: (contentId, percent) =>
      request(() => api.post(`/adaptive-learning/content/${contentId}/progress/`, { percent })),
    fetchContentDetail: (id) => request(() => api.get(`/adaptive-learning/content/${id}/`)),
    fetchAdaptiveDashboard: () => request(() => api.get('/adaptive-learning/dashboard/')),
    fetchRecommendations: () => request(() => api.get('/adaptive-learning/recommendations/')),
    markRecommendationClicked: (id) =>
      request(() => api.post(`/adaptive-learning/recommendations/${id}/click/`)),
    // Teacher
    fetchTeacherContents: () => request(() => api.get('/adaptive-learning/teacher/contents/')),
    createContent: (payload) => request(() => api.post('/adaptive-learning/teacher/content/create/', payload)),
    updateContent: (id, payload) => request(() => api.put(`/adaptive-learning/teacher/content/${id}/update/`, payload)),
    deleteContent: (id) => request(() => api.delete(`/adaptive-learning/teacher/content/${id}/delete/`)),
  };
}
