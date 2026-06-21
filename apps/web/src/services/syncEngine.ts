/**
 * syncEngine.ts
 * -------------
 * Drains the `pendingAttendance` IndexedDB queue by posting each record
 * to the real API. Called on app load and whenever the browser goes online.
 */

import { api } from './api';
import {
  getPendingAttendance,
  deletePendingAttendance,
} from './offlineDb';

export type SyncResult = {
  synced: number;
  failed: number;
};

let isSyncing = false;

/**
 * Attempt to upload all pending attendance records.
 * Returns a summary of how many succeeded / failed.
 * Dispatches a DOM event `myklasi:sync-complete` when finished.
 */
export async function syncPendingAttendance(): Promise<SyncResult> {
  // Prevent concurrent sync runs
  if (isSyncing) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const pending = await getPendingAttendance();
    if (pending.length === 0) return { synced: 0, failed: 0 };

    console.log(`[SyncEngine] Syncing ${pending.length} pending attendance record(s)…`);

    for (const record of pending) {
      try {
        await api.post('/attendance/mark', {
          classId: record.classId,
          termId: record.termId,
          date: record.date,
          type: record.type,
          records: record.records,
        });
        await deletePendingAttendance(record.id);
        synced++;
        console.log(`[SyncEngine] ✓ Synced record ${record.id}`);
      } catch (err: any) {
        // 409 Conflict = already submitted for this date; treat as success
        if (err?.response?.status === 409) {
          await deletePendingAttendance(record.id);
          synced++;
          console.log(`[SyncEngine] ✓ Record ${record.id} already on server (409); removed from queue`);
        } else {
          failed++;
          console.warn(`[SyncEngine] ✗ Failed to sync record ${record.id}:`, err?.message);
        }
      }
    }
  } finally {
    isSyncing = false;

    // Notify the app that a sync attempt has finished
    window.dispatchEvent(
      new CustomEvent<SyncResult>('myklasi:sync-complete', {
        detail: { synced, failed },
      })
    );
  }

  return { synced, failed };
}
