import { useState } from 'react';
import api from '../api/client';

export function useAnalytics() {
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
    fetchMyStats: () => request(() => api.get('/analytics/my-stats/')),
    fetchTeacherDashboard: () => request(() => api.get('/analytics/teacher-dashboard/')),
    fetchStudentDashboard: () => request(() => api.get('/analytics/student-dashboard/')),
    fetchStudentReport: (studentId) => request(() => api.get(`/analytics/student-report/${studentId}/`)),
  };
}
