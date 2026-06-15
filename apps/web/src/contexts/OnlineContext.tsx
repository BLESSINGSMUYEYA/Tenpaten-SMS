/**
 * OnlineContext.tsx
 * -----------------
 * Provides network connectivity status and pending-sync count to the entire app.
 * - Listens to window online/offline events
 * - Triggers sync when coming back online
 * - Refreshes pending count after each sync attempt
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { syncPendingAttendance } from '../services/syncEngine';
import { countPendingAttendance } from '../services/offlineDb';

interface OnlineContextValue {
  isOnline: boolean;
  pendingCount: number;
  /** Manually trigger a sync and refresh the pending count. */
  triggerSync: () => Promise<void>;
  /** Refresh the pending count from IndexedDB (call after saving offline). */
  refreshPendingCount: () => Promise<void>;
}

const OnlineContext = createContext<OnlineContextValue>({
  isOnline: navigator.onLine,
  pendingCount: 0,
  triggerSync: async () => {},
  refreshPendingCount: async () => {},
});

export function OnlineContextProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await countPendingAttendance();
      setPendingCount(count);
    } catch {
      // IndexedDB not available (e.g. private browsing on some browsers)
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) return;
    await syncPendingAttendance();
    await refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    // Initial pending count
    refreshPendingCount();

    const handleOnline = async () => {
      setIsOnline(true);
      // Small delay so the network is actually usable before we hammer it
      await new Promise((r) => setTimeout(r, 1000));
      await triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleSyncComplete = () => {
      refreshPendingCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('tenpaten:sync-complete', handleSyncComplete);

    // On mount, if we're online, attempt to sync any leftover records
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('tenpaten:sync-complete', handleSyncComplete);
    };
  }, [triggerSync, refreshPendingCount]);

  return (
    <OnlineContext.Provider value={{ isOnline, pendingCount, triggerSync, refreshPendingCount }}>
      {children}
    </OnlineContext.Provider>
  );
}

export function useOnline() {
  return useContext(OnlineContext);
}
