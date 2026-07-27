import { useState } from 'react';
import api from '../api/client';

export function useMl() {
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
    fetchChurn: () => request(() => api.get('/ml/churn/')),
    fetchNotifications: () => request(() => api.get('/ml/notifications/')),
    dismissNotification: (id) =>
      request(() => api.post(`/ml/notifications/${id}/dismiss/`)),
  };
}
