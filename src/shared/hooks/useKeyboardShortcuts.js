import { useEffect } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPod|iPad/i.test(navigator.platform);

const isEditableTarget = (target) => {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
};

/**
 * Bind global keyboard shortcuts. Each handler in `bindings` is keyed by a
 * normalized shortcut string (lowercased, modifiers in alphabetical order):
 *
 *   - 'mod+z'         → Cmd/Ctrl + Z
 *   - 'mod+shift+z'   → Cmd/Ctrl + Shift + Z
 *   - 'mod+s'
 *   - 'mod+d'
 *   - 'delete'
 *   - 'escape'
 *   - '?'             → Shift+/
 *
 * Handlers receive the original event so they can `preventDefault()`.
 *
 * Editable inputs (text fields, textareas, contenteditable) are excluded from
 * single-key bindings to avoid stealing keystrokes from users typing labels.
 */
export function useKeyboardShortcuts(bindings, { enabled = true } = {}) {
    useEffect(() => {
        if (!enabled) return undefined;

        const onKeyDown = (event) => {
            const editable = isEditableTarget(event.target);
            const mod = isMac ? event.metaKey : event.ctrlKey;
            const shift = event.shiftKey;
            const alt = event.altKey;
            const key = event.key.toLowerCase();

            const parts = [];
            if (mod) parts.push('mod');
            if (alt) parts.push('alt');
            if (shift) parts.push('shift');
            // Special-case the literal "?" because shift+/ produces it on US.
            if (event.key === '?') {
                parts.push('?');
            } else {
                parts.push(key);
            }
            const shortcut = parts.join('+');

            const handler = bindings[shortcut];
            if (!handler) return;

            // Allow modifier shortcuts inside inputs (Cmd+S, Cmd+Z, etc.) but
            // block plain keys (Delete, Escape, ?) from firing while typing.
            if (editable && !mod && key !== 'escape') return;

            handler(event);
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [bindings, enabled]);
}

export const shortcutLabel = (combo) =>
    combo
        .split('+')
        .map((part) => {
            if (part === 'mod') return isMac ? '⌘' : 'Ctrl';
            if (part === 'shift') return isMac ? '⇧' : 'Shift';
            if (part === 'alt') return isMac ? '⌥' : 'Alt';
            if (part === 'delete') return '⌫';
            if (part === 'escape') return 'Esc';
            if (part === '?') return '?';
            return part.toUpperCase();
        })
        .join(isMac ? '' : '+');

