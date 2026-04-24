import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Alert, Button, IconButton, Slide, Snackbar, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Lightweight toast system. Stacks notifications top-right, auto-dismisses
 * after `duration` (defaults vary by severity), and supports a single optional
 * action (e.g. "Undo"). Imperatively driven via `useToasts()`.
 */
const ToastContext = createContext(null);

const DEFAULTS = {
    success: 3500,
    info: 3500,
    warning: 5000,
    error: 6000,
};

let _id = 0;
const nextId = () => ++_id;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef(new Map());

    const dismiss = useCallback((id) => {
        const t = timers.current.get(id);
        if (t) {
            clearTimeout(t);
            timers.current.delete(id);
        }
        setToasts((list) => list.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback(
        (toast) => {
            const id = nextId();
            const severity = toast.severity || 'info';
            const duration = toast.duration ?? DEFAULTS[severity];
            const item = { id, severity, ...toast };
            setToasts((list) => [...list, item]);
            if (duration > 0) {
                timers.current.set(
                    id,
                    setTimeout(() => dismiss(id), duration)
                );
            }
            return id;
        },
        [dismiss]
    );

    const api = useMemo(
        () => ({
            success: (msg, opts) => push({ message: msg, severity: 'success', ...opts }),
            info: (msg, opts) => push({ message: msg, severity: 'info', ...opts }),
            warning: (msg, opts) => push({ message: msg, severity: 'warning', ...opts }),
            error: (msg, opts) => push({ message: msg, severity: 'error', ...opts }),
            dismiss,
        }),
        [push, dismiss]
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <Snackbar
                open={toasts.length > 0}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={SlideLeft}
                sx={{ top: { xs: 80, sm: 88 } }}
            >
                <Stack spacing={1} sx={{ width: 360, maxWidth: 'calc(100vw - 32px)' }}>
                    {toasts.map((toast) => (
                        <Alert
                            key={toast.id}
                            severity={toast.severity}
                            variant="filled"
                            elevation={6}
                            action={
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    {toast.action && (
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                                toast.action.onClick();
                                                dismiss(toast.id);
                                            }}
                                        >
                                            {toast.action.label}
                                        </Button>
                                    )}
                                    <IconButton
                                        size="small"
                                        color="inherit"
                                        aria-label="Dismiss"
                                        onClick={() => dismiss(toast.id)}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            }
                            sx={{ alignItems: 'center', borderRadius: 2 }}
                        >
                            {toast.message}
                        </Alert>
                    ))}
                </Stack>
            </Snackbar>
        </ToastContext.Provider>
    );
}

const SlideLeft = (props) => <Slide {...props} direction="left" />;

export function useToasts() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToasts must be used inside <ToastProvider>');
    return ctx;
}

