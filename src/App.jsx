import React, { Suspense, lazy, useEffect, useMemo } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { buildTheme } from './app/theme';
import { useBuilderStore } from './features/form-builder/state/builderStore';
import { ToastProvider } from './shared/ui/Toasts';

const BuilderApp = lazy(() => import('./features/form-builder/components/BuilderApp'));
const FormsPage = lazy(() => import('./features/forms-list/FormsPage'));

/**
 * Routing shell. The MUI theme is rebuilt whenever the user toggles dark
 * mode in the store, and we mirror the mode to a `data-theme` attribute on
 * the root element so the global CSS variables can flip in lockstep.
 */
export default function App() {
    const themeMode = useBuilderStore((s) => s.themeMode);
    const theme = useMemo(() => buildTheme(themeMode), [themeMode]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeMode);
    }, [themeMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
                <BrowserRouter>
                    <Suspense fallback={<RouteFallback />}>
                        <Routes>
                            <Route path="/" element={<BuilderApp />} />
                            <Route path="/forms" element={<FormsPage />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </ToastProvider>
        </ThemeProvider>
    );
}

function RouteFallback() {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'background.default',
            }}
        >
            <CircularProgress />
        </Box>
    );
}

