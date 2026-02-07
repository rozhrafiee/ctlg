// src/hooks/useApi.js
import { useState, useCallback } from 'react';
import { handleApiError } from '@/api/errorHandler';

/**
 * 🪝 Custom Hook برای مدیریت APIهای async با loading/error states
 * 
 * @param {Function} apiFunc - تابع API که باید فراخوانی شود
 * @param {object} options - تنظیمات اختیاری
 * 
 * @returns {object} - شامل execute, loading, error, data
 * 
 * @example
 * const { execute, loading, error, data } = useApi(studentAPI.getDashboard);
 * 
 * useEffect(() => {
 *   execute();
 * }, []);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <Dashboard data={data} />;
 */
export const useApi = (apiFunc, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    showErrorToast = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * تابع اصلی فراخوانی API
   */
  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunc(...args);
        setData(result);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        if (showErrorToast) {
          handleApiError(err);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, onSuccess, onError, showErrorToast]
  );

  /**
   * ریست کردن state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
  };
};

/**
 * 🪝 Hook ساده‌تر برای فراخوانی‌های یک‌باره (مثل fetch در useEffect)
 * 
 * این hook خودش در اولین رندر API را فراخوانی می‌کند
 * 
 * @example
 * const { data, loading, error, refetch } = useFetch(studentAPI.getDashboard);
 */
export const useFetch = (apiFunc, dependencies = []) => {
  const { execute, loading, error, data } = useApi(apiFunc);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // فراخوانی خودکار در اولین render
  useState(() => {
    if (isInitialLoad) {
      execute();
      setIsInitialLoad(false);
    }
  });

  // تابع refetch برای فراخوانی دوباره
  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * 🪝 Hook برای pagination
 * 
 * @example
 * const { data, loading, page, nextPage, prevPage, hasMore } = usePagination(
 *   teacherContentAPI.getMyContent
 * );
 */
export const usePagination = (apiFunc, pageSize = 10) => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const { execute, loading, error } = useApi(apiFunc, {
    onSuccess: (result) => {
      if (result.length < pageSize) {
        setHasMore(false);
      }
      setAllData((prev) => (page === 1 ? result : [...prev, ...result]));
    },
  });

  const nextPage = useCallback(() => {
    if (!loading && hasMore) {
      setPage((p) => p + 1);
      execute(page + 1, pageSize);
    }
  }, [loading, hasMore, execute, page, pageSize]);

  const prevPage = useCallback(() => {
    if (!loading && page > 1) {
      setPage((p) => p - 1);
    }
  }, [loading, page]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    page,
    nextPage,
    prevPage,
    hasMore,
    reset,
  };
};

/**
 * 🪝 Hook برای mutation (POST/PUT/DELETE)
 * 
 * @example
 * const { mutate, loading } = useMutation(teacherContentAPI.createContent, {
 *   onSuccess: () => {
 *     navigate('/teacher/content');
 *   }
 * });
 * 
 * const handleSubmit = async (data) => {
 *   await mutate(data);
 * };
 */
export const useMutation = (apiFunc, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    showSuccessToast = false,
    showErrorToast = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFunc(...args);

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        setError(err);

        if (showErrorToast) {
          handleApiError(err);
        }

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, onSuccess, onError, showErrorToast]
  );

  return {
    mutate,
    loading,
    error,
  };
};
