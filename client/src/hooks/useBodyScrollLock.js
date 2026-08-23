import { useEffect } from 'react';

/**
 * Custom hook to lock body scrolling when a modal/overlay is open.
 * Supports multiple concurrent modals cleanly using a reference counter.
 */
let lockCount = 0;

export function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      document.body.style.overflow = 'hidden';
    }
    lockCount++;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
