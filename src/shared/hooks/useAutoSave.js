import { useEffect, useRef } from 'react';

/**
 * Debounced auto-save. Re-runs `save` whenever any of `deps` changes, but
 * coalesces bursts so we don't write on every keystroke. Returns nothing —
 * use a separate state slice (e.g. `isDirty`, `lastSavedAt`) for UI feedback.
 */
export function useAutoSave(save, deps, { delay = 1000, enabled = true } = {}) {
    const timer = useRef(null);
    const saveRef = useRef(save);
    saveRef.current = save;

    useEffect(() => {
        if (!enabled) return undefined;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            saveRef.current();
        }, delay);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, deps.concat([delay, enabled])); // deps array is provided by caller; spread inline.
}

