/**
 * useApi.ts
 * ---------
 * Custom hooks for API interaction with offline support.
 *
 * useQuery  — GET with IndexedDB cache fallback when offline
 * useMutation — POST/PUT/PATCH/DELETE that queues attendance offline when needed
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  cacheClasses,
  getCachedClasses,
  cacheTerms,
  getCachedTerms,
  cacheStudents,
  getCachedStudents,
  savePendingAttendance,
} from '../services/offlineDb';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Try to retrieve cached data for known endpoints that need offline support.
 * Returns null for unknown endpoints (they won't be cached).
 */
async function getOfflineFallback(url: string): Promise<unknown | null> {
  if (url.includes('/schools/classes')) {
    return getCachedClasses();
  }
  if (url.includes('/schools/terms')) {
    return getCachedTerms();
  }
  // Student lists: /people/students?classId=<id>
  const studentMatch = url.match(/classId=([^&]+)/);
  if (url.includes('/people/students') && studentMatch) {
    return getCachedStudents(studentMatch[1]);
  }
  return null;
}

/**
 * Persist fresh API data for offline use on known endpoints.
 */
async function persistForOffline(url: string, data: unknown): Promise<void> {
  try {
    if (url.includes('/schools/classes')) {
      await cacheClasses(data as any);
    } else if (url.includes('/schools/terms')) {
      await cacheTerms(data as any);
    } else {
      const studentMatch = url.match(/classId=([^&]+)/);
      if (url.includes('/people/students') && studentMatch) {
        await cacheStudents(studentMatch[1], data as any);
      }
    }
  } catch {
    // Non-fatal — just means offline data won't be refreshed
  }
}

// ─── useQuery ────────────────────────────────────────────────────────────────

/**
 * A custom hook for performing GET queries with offline fallback.
 * @param url The endpoint URL to fetch from.
 * @param enabled Set to false to delay automatic execution.
 * @param deps Dependency array to re-fetch when items change.
 */
export function useQuery<T>(url: string, enabled = true, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      const result = response.data.data;
      setData(result);
      setIsFromCache(false);
      // Persist for offline use (fire-and-forget)
      persistForOffline(url, result);
    } catch (err: any) {
      // Network error — try IndexedDB cache
      if (!err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
        const cached = await getOfflineFallback(url);
        if (cached) {
          setData(cached as T);
          setIsFromCache(true);
          return; // No error set — we have data from cache
        }
      }
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

  return { data, loading, error, refetch: fetchData, setData, isFromCache };
}

// ─── useMutation ─────────────────────────────────────────────────────────────

/**
 * A custom hook for triggering mutating endpoints (POST, PUT, PATCH, DELETE).
 * For POST /attendance/mark: automatically queues the payload offline when
 * the network is unavailable, instead of throwing.
 *
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
  const [savedOffline, setSavedOffline] = useState(false);

  const mutate = useCallback(
    async (variables?: TVariables): Promise<TData & { _offline?: boolean }> => {
      setLoading(true);
      setError(null);
      setSavedOffline(false);
      try {
        const response = await api[method](url, variables);
        const result = response.data.data;
        setData(result);
        return result;
      } catch (err: any) {
        // Offline path: only for attendance mark endpoint
        const isNetworkError = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
        if (isNetworkError && url.includes('/attendance/mark') && variables) {
          const payload = variables as any;
          await savePendingAttendance({
            classId: payload.classId,
            termId: payload.termId,
            date: payload.date,
            type: payload.type,
            records: payload.records,
          });
          setSavedOffline(true);
          // Dispatch event so OnlineContext refreshes the pending count
          window.dispatchEvent(new Event('myklasi:pending-saved'));
          // Return a synthetic "success" result so the UI can show offline badge
          return { _offline: true } as TData & { _offline?: boolean };
        }

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
    savedOffline,
    reset: () => {
      setData(null);
      setError(null);
      setSavedOffline(false);
    },
  };
}
