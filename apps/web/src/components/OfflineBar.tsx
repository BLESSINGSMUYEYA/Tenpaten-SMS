/**
 * OfflineBar.tsx
 * --------------
 * A fixed top banner that appears when the user is offline or has pending records.
 * - Slides in/out smoothly
 * - Shows pending record count with a pulsing dot
 * - Shows a green "Synced!" flash for 3 seconds after a successful sync
 */

import { useEffect, useState } from 'react';
import { useOnline } from '../contexts/OnlineContext';

export function OfflineBar() {
  const { isOnline, pendingCount, triggerSync } = useOnline();
  const [syncedFlash, setSyncedFlash] = useState(false);
  const [prevPending, setPrevPending] = useState(pendingCount);

  // Show "Synced!" flash when pending count drops to 0 after being > 0
  useEffect(() => {
    if (prevPending > 0 && pendingCount === 0 && isOnline) {
      setSyncedFlash(true);
      const timer = setTimeout(() => setSyncedFlash(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevPending(pendingCount);
  }, [pendingCount, isOnline, prevPending]);

  const visible = !isOnline || pendingCount > 0 || syncedFlash;

  if (!visible) return null;

  // ── Synced flash (green) ─────────────────────────────────────────────
  if (syncedFlash && isOnline && pendingCount === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 py-2 px-4 text-xs font-bold animate-slide-down"
        style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }}
      >
        <span style={{ fontSize: 14 }}>✅</span>
        <span className="text-white tracking-wide">All records synced successfully!</span>
      </div>
    );
  }

  // ── Pending / offline (amber) ────────────────────────────────────────
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-2 py-2 px-4 text-xs font-bold animate-slide-down"
      style={{ background: 'linear-gradient(90deg, #b45309, #d97706)' }}
    >
      <div className="flex items-center gap-2 text-white">
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ background: '#fde68a' }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#fef3c7' }} />
        </span>

        {isOnline ? (
          <span>
            ☁ Uploading attendance&nbsp;—&nbsp;
            <strong>{pendingCount}</strong>&nbsp;record{pendingCount !== 1 ? 's' : ''} pending
          </span>
        ) : (
          <span>
            ☁ You&apos;re offline
            {pendingCount > 0 && (
              <>
                &nbsp;—&nbsp;
                <strong>{pendingCount}</strong>&nbsp;record{pendingCount !== 1 ? 's' : ''} saved locally, will upload when connected
              </>
            )}
          </span>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <button
          onClick={triggerSync}
          className="text-white underline underline-offset-2 hover:no-underline whitespace-nowrap"
        >
          Sync now
        </button>
      )}
    </div>
  );
}
