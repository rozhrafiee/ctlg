import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const response = await api.get('/accounts/profile/');
    return response.data;
  };

  const bootstrap = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const profile = await fetchProfile();
      setUser(profile);
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async ({ username, password }) => {
    const response = await api.post('/accounts/login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    const profile = await fetchProfile();
    setUser(profile);
    return profile;
  };

  const register = async (payload) => {
    await api.post('/accounts/register/', payload);
    return login({ username: payload.username, password: payload.password });
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile: async () => {
      const profile = await fetchProfile();
      setUser(profile);
      return profile;
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
