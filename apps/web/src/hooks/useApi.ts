import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * A custom hook for performing GET queries.
 * @param url The endpoint URL to fetch from.
 * @param enabled Set to false to delay automatic execution.
 * @param deps Dependency array to re-fetch when items change.
 */
export function useQuery<T>(url: string, enabled = true, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData, enabled, ...deps]);

  return { data, loading, error, refetch: fetchData, setData };
}

/**
 * A custom hook for triggering mutating endpoints (POST, PUT, PATCH, DELETE).
 * @param url The endpoint URL.
 * @param method The HTTP verb (defaults to 'post').
 */
export function useMutation<TVariables = any, TData = any>(
  url: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post'
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api[method](url, variables);
        const result = response.data.data;
        setData(result);
        return result;
      } catch (err: any) {
        const errMsg = err.response?.data?.message || err.message || 'An error occurred';
        setError(errMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method]
  );

  return {
    mutate,
    data,
    loading,
    error,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}
