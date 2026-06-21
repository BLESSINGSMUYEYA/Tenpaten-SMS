/**
 * offlineDb.ts
 * -----------
 * Manages all offline data persistence using IndexedDB via the `idb` library.
 * Stores:
 *   - pendingAttendance : attendance submissions queued for upload
 *   - cachedClasses     : class list snapshot
 *   - cachedTerms       : term list snapshot
 *   - cachedStudents    : per-class student list snapshots
 */

import { openDB, type IDBPDatabase } from 'idb';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PendingAttendanceRecord {
  id: string;            // client-generated UUID
  savedAt: number;       // Unix timestamp (ms)
  classId: string;
  termId: string;
  date: string;          // ISO date string e.g. "2025-09-02"
  type: string;          // e.g. "morning"
  records: Array<{ studentId: string; status: string }>;
}

export interface CachedStudent {
  id: string;
  admissionNumber: string;
  user: { id: string; firstName: string; lastName: string };
}

export interface CachedClass {
  id: string;
  displayName: string;
}

export interface CachedTerm {
  id: string;
  name: string;
  isCurrent: boolean;
}

// ─── DB Initialisation ───────────────────────────────────────────────────────

const DB_NAME = 'myklasi-offline';
const DB_VERSION = 1;

type MyKlasiDB = {
  pendingAttendance: {
    key: string;
    value: PendingAttendanceRecord;
  };
  cachedClasses: {
    key: 'classes';
    value: { key: 'classes'; data: CachedClass[] };
  };
  cachedTerms: {
    key: 'terms';
    value: { key: 'terms'; data: CachedTerm[] };
  };
  cachedStudents: {
    key: string; // classId
    value: { key: string; data: CachedStudent[] };
  };
};

let dbPromise: Promise<IDBPDatabase<MyKlasiDB>> | null = null;

function getDb(): Promise<IDBPDatabase<MyKlasiDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MyKlasiDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pendingAttendance')) {
          db.createObjectStore('pendingAttendance', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cachedClasses')) {
          db.createObjectStore('cachedClasses', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('cachedTerms')) {
          db.createObjectStore('cachedTerms', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('cachedStudents')) {
          db.createObjectStore('cachedStudents', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Pending Attendance ──────────────────────────────────────────────────────

/** Save an attendance submission to the pending queue. */
export async function savePendingAttendance(
  payload: Omit<PendingAttendanceRecord, 'id' | 'savedAt'>
): Promise<PendingAttendanceRecord> {
  const db = await getDb();
  const record: PendingAttendanceRecord = {
    id: crypto.randomUUID(),
    savedAt: Date.now(),
    ...payload,
  };
  await db.put('pendingAttendance', record);
  return record;
}

/** Retrieve all pending attendance records. */
export async function getPendingAttendance(): Promise<PendingAttendanceRecord[]> {
  const db = await getDb();
  return db.getAll('pendingAttendance');
}

/** Remove a pending record after it has been successfully uploaded. */
export async function deletePendingAttendance(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('pendingAttendance', id);
}

/** Count how many records are waiting to be synced. */
export async function countPendingAttendance(): Promise<number> {
  const db = await getDb();
  return db.count('pendingAttendance');
}

// ─── Cached Classes ──────────────────────────────────────────────────────────

export async function cacheClasses(classes: CachedClass[]): Promise<void> {
  const db = await getDb();
  await db.put('cachedClasses', { key: 'classes', data: classes });
}

export async function getCachedClasses(): Promise<CachedClass[] | null> {
  const db = await getDb();
  const entry = await db.get('cachedClasses', 'classes');
  return entry?.data ?? null;
}

// ─── Cached Terms ────────────────────────────────────────────────────────────

export async function cacheTerms(terms: CachedTerm[]): Promise<void> {
  const db = await getDb();
  await db.put('cachedTerms', { key: 'terms', data: terms });
}

export async function getCachedTerms(): Promise<CachedTerm[] | null> {
  const db = await getDb();
  const entry = await db.get('cachedTerms', 'terms');
  return entry?.data ?? null;
}

// ─── Cached Students ─────────────────────────────────────────────────────────

export async function cacheStudents(classId: string, students: CachedStudent[]): Promise<void> {
  const db = await getDb();
  await db.put('cachedStudents', { key: classId, data: students });
}

export async function getCachedStudents(classId: string): Promise<CachedStudent[] | null> {
  const db = await getDb();
  const entry = await db.get('cachedStudents', classId);
  return entry?.data ?? null;
}
